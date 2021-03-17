// Watson Assistant V1 api
// https://cloud.ibm.com/apidocs/assistant/assistant-v1?code=node

const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

class WasonAssistantV1 {

    constructor() {}

    /**
     * config: {
     *      @param {string} version
     *      @param {string} apikey
     *      @param {string} url
     *      @param {object} data
     * }
     * */
    
    // Message
    message(params){ return getAssistantV1(params).message(params.data); }

    // Workspaces
    listWorkspaces(params){ return getAssistantV1(params).listWorkspaces(); }
    createWorkspace(params){ return getAssistantV1(params).createWorkspace(params.data); }
    getWorkspace(params){ return getAssistantV1(params).getWorkspace(params.data); }
    updateWorkspace(params){ return getAssistantV1(params).updateWorkspace(params.data); }
    deleteWorkspace(params){ return getAssistantV1(params).deleteWorkspace(params.data); }

    // Intents
    listIntents(params){ return getAssistantV1(params).listIntents(params.data); }
    createIntent(params){ return getAssistantV1(params).createIntent(params.data); }
    getIntent(params){ return getAssistantV1(params).getIntent(params.data); }
    updateIntent(params){ return getAssistantV1(params).updateIntent(params.data); }
    deleteIntent(params){ return getAssistantV1(params).deleteIntent(params.data); }

    // Examples
    listExamples(params){ return getAssistantV1(params).listExamples(params.data); }
    createExample(params){ return getAssistantV1(params).createExample(params.data); }
    getExample(params){ return getAssistantV1(params).getExample(params.data); }
    updateExample(params){ return getAssistantV1(params).updateExample(params.data); }
    deleteExample(params){ return getAssistantV1(params).deleteExample(params.data); }

    // Counterexamples
    listCounterexamples(params){ return getAssistantV1(params).listCounterexamples(params.data); }
    createCounterexample(params){ return getAssistantV1(params).createCounterexample(params.data); }
    getCounterexample(params){ return getAssistantV1(params).getCounterexample(params.data); }
    updateCounterexample(params){ return getAssistantV1(params).updateCounterexample(params.data); }
    deleteCounterexample(params){ return getAssistantV1(params).deleteCounterexample(params.data); }
    
    // Entities
    listEntities(params){ return getAssistantV1(params).listEntities(params.data); }
    createEntity(params){ return getAssistantV1(params).createEntity(params.data); }
    getEntity(params){ return getAssistantV1(params).getEntity(params.data); }
    updateEntity(params){ return getAssistantV1(params).updateEntity(params.data); }
    deleteEntity(params){ return getAssistantV1(params).deleteEntity(params.data); }

    // Mentions
    listMentions(params){ return getAssistantV1(params).listMentions(params.data); }

    // Values
    listValues(params){ return getAssistantV1(params).listValue(params.data); }
    createValue(params){ return getAssistantV1(params).createValue(params.data); }
    getValue(params){ return getAssistantV1(params).getValue(params.data); }
    updateValue(params){ return getAssistantV1(params).updateValue(params.data); }
    deleteValue(params){ return getAssistantV1(params).deleteValue(params.data); }
    
    // Synonyms
    listSynonyms(params){ return getAssistantV1(params).listSynonyms(params.data); }
    createSynonym(params){ return getAssistantV1(params).createSynonym(params.data); }
    getSynonym(params){ return getAssistantV1(params).getSynonym(params.data); }
    updateSynonym(params){ return getAssistantV1(params).updateSynonym(params.data); }
    deleteSynonym(params){ return getAssistantV1(params).deleteSynonym(params.data); }

    // Synonyms
    listSynonyms(params){ return getAssistantV1(params).listSynonyms(params.data); }
    createSynonym(params){ return getAssistantV1(params).createSynonym(params.data); }
    getSynonym(params){ return getAssistantV1(params).getSynonym(params.data); }
    updateSynonym(params){ return getAssistantV1(params).updateSynonym(params.data); }
    deleteSynonym(params){ return getAssistantV1(params).deleteSynonym(params.data); }
    
    // DialogNodes
    listDialogNodes(params){ return getAssistantV1(params).listDialogNodes(params.data); }
    createDialogNode(params){ return getAssistantV1(params).createDialogNode(params.data); }
    getDialogNode(params){ return getAssistantV1(params).getDialogNode(params.data); }
    updateDialogNode(params){ return getAssistantV1(params).updateDialogNode(params.data); }
    deleteDialogNode(params){ return getAssistantV1(params).deleteDialogNode(params.data); }
    
    // Logs
    listLogs(params){ return getAssistantV1(params).listLogs(params.data); }
    listAllLogs(params){ return getAssistantV1(params).listAllLogs(params.data); }

    // User Data
    deleteUserData(params){ return getAssistantV1(params).deleteUserData(params.data); }
}

module.exports = new WasonAssistantV1();

let getAssistantV1 = function(config){
    return new AssistantV1({
        version: config.version,
        authenticator: new IamAuthenticator({
            apikey: config.apikey,
        }),
        url: config.url,
    });
}