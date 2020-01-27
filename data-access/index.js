const makeIdQueue = require("./queue");
const makeTimersDb = require("./timers-db");
const ApolloClient = require("apollo-boost").default;
const gql = require("graphql-tag");
require("cross-fetch/polyfill");

const findTimerByIdQuery = gql`
  query FindTimerById($id: uuid) {
    __typename
    timers(where: { id: { _eq: $id } }) {
      id
      duration
      remaining_duration
    }
  }
`;

const updateTimerMutation = gql`
  mutation MyMutation($id: uuid, $remaining_duration: Int) {
    __typename
    update_timers(
      where: { id: { _eq: $id } }
      _set: { remaining_duration: $remaining_duration }
    ) {
      returning {
        id
        duration
        remaining_duration
      }
    }
  }
`;

const client = new ApolloClient({
  uri: process.env.GRAPHQL_API
});

async function makeDb() {
  return {
    findById,
    update
  };
  async function findById(id) {
    return client
      .query({
        query: findTimerByIdQuery,
        variables: { id }
      })
      .then(({ timers }) => timers[0])
      .catch(error => console.error(error));
  }
  async function update(timer) {
    return client
      .mutate({
        mutation: updateTimerMutation,
        variables: {
          id: timer.id,
          remaining_duration: timer.remaining_duration
        }
      })
      .then(({ update_timers: { returning } }) => returning[0])
      .catch(error => console.error(error));
  }
}

async function makeQueue() {
  return {
    enqueue: async () => true,
    dequeue: async () => true,
    findAll: async () => []
  };
}

const timersDb = makeTimersDb({ makeDb });
const queue = makeIdQueue({ makeQueue });

const dataAccess = Object.freeze({
  timersDb,
  queue
});

module.exports = dataAccess;
