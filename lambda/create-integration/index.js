const axios = require('axios').default;
const cfnResponse = require('cfn-response-promise')

const URL = process.env.URL
const ARN = process.env.ARN
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID
const ROLE_ARN = process.env.ROLE_ARN
const NAME = process.env.NAME
const DESCRIPTION = process.env.DESCRIPTION
const TYPE = process.env.TYPE
const API_KEY = process.env.API_KEY

const HEADERS = {
    'Api-Version': 'v1',
    Accept: 'application/json',
    Authorization: `ApiKey ${API_KEY}`,
}

const createIntegration = async (url, name, description, type, arn, awsAccountId, roleArn) => {
    const body = {
        name,
        description,
        type,
        configuration: {
            arn,
            awsAccountId,
            roleArn,
        },
    }
    try {
        const result = await axios.post(url, body, { headers: HEADERS })
        console.log(JSON.stringify(result.data, null, 2))
        return result.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

const deleteIntegration = async (url, id) => {
    try {
        const result = await axios.delete(`${url}/${id}`, { headers: HEADERS })
        console.log(JSON.stringify(result.data, null, 2))
        return result.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

const updateIntegration = async (url, id, name, description, type, arn, awsAccountId, roleArn) => {
    //TODO: implement
}

exports.handler = async (event, context) => {
    console.log(JSON.stringify(event, null, 2))
    let responseStatus = cfnResponse.SUCCESS
    let responseData = {}
    let physicalResourceId = ''
    try {
        if (event.RequestType == 'Create') {
            // Create the integration
            responseData = await createIntegration(URL, NAME, DESCRIPTION, TYPE, ARN, AWS_ACCOUNT_ID, ROLE_ARN)
            physicalResourceId = responseData.id
        } else if (event.RequestType == 'Update') {
            // Update the integration
            physicalResourceId = event.PhysicalResourceId
            responseData = await updateIntegration(URL, event.PhysicalResourceId, NAME, DESCRIPTION, TYPE, ARN, AWS_ACCOUNT_ID, ROLE_ARN)
        } else if (event.RequestType == 'Delete') {
            // Delete the integration
            physicalResourceId = event.PhysicalResourceId
            responseData = await deleteIntegration(URL, event.PhysicalResourceId)
        }
    }
    catch (error) {
        console.error(error)
        responseStatus = cfnResponse.FAILED
        responseData = { Error: error }
    }
    return await cfnResponse.send(event, context, responseStatus, responseData, physicalResourceId);
}