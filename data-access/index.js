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

const findAllQuery = gql`
  query MyQuery {
    queued_timers {
      timer_id
    }
  }
`;

const insertQueuedTimerMutation = gql`
  mutation MyMutation($id: String) {
    __typename
    insert_queued_timers(objects: { timer_id: $id }) {
      returning {
        timer_id
      }
    }
  }
`;

const deleteQueuedTimerMutation = gql`
  mutation MyMutation($id: String) {
    __typename
    delete_queued_timers(where: { timer_id: { _eq: $id } }) {
      affected_rows
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
    enqueue: async id => {
      return client
        .mutate({
          mutation: insertQueuedTimerMutation,
          variables: {
            id
          }
        })
        .then(
          ({
            insert_queued_timers: {
              returning: { timer_id }
            }
          }) => timer_id === id
        )
        .catch(error => console.error(error));
    },
    dequeue: async id => {
      return client
        .mutate({
          mutation: deleteQueuedTimerMutation,
          variables: {
            id
          }
        })
        .then(
          ({ delete_queued_timers: { affected_rows } }) => affected_rows === 1
        )
        .catch(error => console.error(error));
    },
    findAll: async () => {
      return client
        .query({
          query: findAllQuery
        })
        .then(({ queued_timers }) => queued_timers.map(({ id }) => id))
        .catch(error => console.error(error));
    }
  };
}

const timersDb = makeTimersDb({ makeDb });
const queue = makeIdQueue({ makeQueue });

const dataAccess = Object.freeze({
  timersDb,
  queue
});

module.exports = dataAccess;
