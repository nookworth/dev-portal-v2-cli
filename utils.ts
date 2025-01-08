import axios from 'axios'

export const fetchPRs = async (url: string) => {
  try {
    const response = await axios.get(url) // Axios automatically parses JSON
    return response.data
  } catch (error) {
    if (error.response) {
      // The request was made, and the server responded with a status code
      // that falls outside of the 2xx range
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      // The request was made, but no response was received
      console.error('No response received:', error.request)
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message)
    }
  }
}
