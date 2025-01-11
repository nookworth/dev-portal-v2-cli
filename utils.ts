import axios from 'axios'
import { urlConstants } from './constants'

const { base, testBase } = urlConstants

/**@todo find a way to determine the environment */
export const fetchPRs = async (test: boolean = true) => {
  const url = test ? testBase : base
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error:', error.message)
    }
  }
}

export const fetchSinglePR = async (test: boolean = true, prNumber: number) => {
  const url = test ? testBase : base

  try {
    const response = await axios.get(`${url}/${prNumber}`)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error:', error.message)
    }
  }
}

export const postToSlack = async (
  test: boolean = true,
  body: {
    title: string
    url: string
  }
) => {
  const url = test ? testBase : base
  try {
    const response = await axios.post(`${url}/review-message`, body)
    console.log({ response })
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error:', error.message)
    }
  }
}
