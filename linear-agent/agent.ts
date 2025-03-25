import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from '@langchain/core/messages'
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
} from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { Runnable } from '@langchain/core/runnables'
import { linearTool, patchTool } from './tools.ts'

const agentState = Annotation.Root({
  linearTicket: Annotation<ToolMessage[]>,
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  patches: Annotation<ToolMessage[]>,
})

type AgentState = typeof agentState.State

const createAgent = async (llm: BaseChatModel, systemMessage: string) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a helpful AI assistant, collaborating with other assistants. Execute what you can to make progress.\n{systemMessage}`,
    ],
    new MessagesPlaceholder('messages'),
  ])

  const partialPrompt = await prompt.partial({
    systemMessage,
  })

  return partialPrompt.pipe(llm)
}

// https://langchain-ai.github.io/langgraphjs/tutorials/reflection/reflection/#define-graph
const makeWriterNode = (agent: Runnable) => async (state: AgentState) => {
  const { messages } = state
  return {
    messages: [await agent.invoke({ messages })],
  }
}

const makeEditorNode = (agent: Runnable) => async (state: AgentState) => {
  const { messages } = state
  const res = await agent.invoke({ messages })
  return {
    messages: [new HumanMessage({ content: res.content })],
  }
}

// https://langchain-ai.github.io/langgraphjs/how-tos/force-calling-a-tool-first/#define-the-nodes
const makeStartNode = (prNumber: string, ticketNumber: string) => () => {
  return {
    messages: [
      new AIMessage({
        content: '',
        tool_calls: [
          {
            name: 'linear',
            args: {
              ticketNumber,
            },
            id: 'initial_linear',
          },
          {
            name: 'patches',
            args: {
              prNumber,
            },
            id: 'initial_patches',
          },
        ],
      }),
    ],
  }
}

const tools = [linearTool, patchTool]

const router = (state: AgentState) => {
  const { messages } = state
  const lastMessage = messages.at(messages.length - 1)

  if (
    typeof lastMessage?.content === 'string' &&
    lastMessage.content.includes('FINAL ANSWER')
  ) {
    console.log('ENDING GRAPH')
    return '__end__'
  }

  return 'continue'
}

const writerPrompt = `
You are an assistant tasked with evaluating the degree to which code changes from a pull request meet the requirements of the corresponding Linear ticket. Take the following into account:
- Base your report on both the description and comments from the Linear ticket.
- Your report should be brief.
- Your report will be evaluated by your superior who may suggest ways to improve it. 
- Do not address the evaluator directly; simply provide an updated report.
- If you have concerns about the code changes, say so.
- If you are uncertain about whether the code changes meet the requirements of the Linear ticket, say so.
- You will not be punished for negative evaluations or mistakes based on incomplete information.
- Always state your reasons for your evaluation.
`

const editorPrompt = `
You are a report editor tasked with giving feedback on written reports. Focus on ensuring the following criteria are met:

- The report should be brief, suitable for a busy executive to read.
- The report writer is allowed to summarize the code changes, but this section should be kept to a bare minimum.
- The report should evaluate the degree to which the code changes meet the requirements of the Linear ticket.
- If the report is merely a description of the changes, it is not ready.

When you are satisfied with the report, prefix your response with FINAL ANSWER so the writer knows to stop.
Provide reasons for your decision regardless of whether the report is ready or not.
`

export const getLinearReport = async (
  prNumber: string,
  ticketNumber: string
) => {
  let report = ''
  const llm = new ChatOpenAI({ model: 'gpt-4o-mini' })
  const toolNode = new ToolNode(tools)
  const writerAgent = await createAgent(llm, writerPrompt)
  const editorAgent = await createAgent(llm, editorPrompt)
  const writerNode = makeWriterNode(writerAgent)
  const editorNode = makeEditorNode(editorAgent)
  const startNode = makeStartNode(prNumber, ticketNumber)

  const workflow = new StateGraph(agentState)
    .addNode('startNode', startNode)
    .addNode('Writer', writerNode)
    .addNode('Editor', editorNode)
    .addNode('callTool', toolNode)
    .addEdge(START, 'startNode')
    .addEdge('startNode', 'callTool')
    .addEdge('callTool', 'Writer')
    .addEdge('Writer', 'Editor')
    .addConditionalEdges('Editor', router, { continue: 'Writer', __end__: END })

  const app = workflow.compile({ checkpointer: new MemorySaver() })

  const stream = await app.stream(
    {
      messages: [
        new HumanMessage({
          content: 'Generate a report on the given Linear ticket',
        }),
      ],
    },
    {
      configurable: { thread_id: 'test-thread' },
      streamMode: 'updates',
    }
  )

  for await (const chunk of stream) {
    for (const [_, value] of Object.entries(chunk)) {
      const { messages } = value as { messages: BaseMessage[] }
      const messageContent = messages.map(({ content }) => content).join('')

      // Editor node has final say, which means the final report will be the previous messages
      if (messageContent.includes('FINAL ANSWER')) {
        return report
      }
      report = messageContent
    }
  }

  return report
}
