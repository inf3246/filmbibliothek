const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');

const PingHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'PingIntent');
  },
  handle(handlerInput) {
    const speechOutput = "Pong";

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const SaveNameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return(request.type === 'IntentRequest'
        && request.intent.name === 'SaveNameIntent');
  },
  async handle(handlerInput) {

    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const data = await handlerInput
                        .attributesManager
                        .getPersistentAttributes();
    data.name = slots.inputName.value;
    handlerInput.attributesManager.setPersistentAttributes(data);
    await handlerInput.attributesManager.savePersistentAttributes(data);

    const speechOutput = "gespeichert";
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ReadNameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return(request.type === 'IntentRequest'
        && request.intent.name === 'ReadNameIntent');
  },
  async handle(handlerInput) {
    const data = await handlerInput
                        .attributesManager
                        .getPersistentAttributes();
    var speechOutput = "";
    if (data.name) {
      console.log("Ausgabe Name");
      console.log(data.name);
      speechOutput = data.name;
    } else {
        speechOutput = "kein Name gespeichert";
    }

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Durchstich';
const HELP_MESSAGE = 'Sage Ping';
const HELP_REPROMPT = 'Wie kann ich dir helfen?';
const STOP_MESSAGE = 'Ende';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    PingHandler,
    SaveNameHandler,
    ReadNameHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName("durchstich_tbl")
  .withAutoCreateTable(true)
  .withDynamoDbClient(
    new AWS.DynamoDB({ apiVersion: "latest", region: "us-east-1" })
  )
  .lambda();
