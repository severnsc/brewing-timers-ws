const makeIdQueue = require("./queue");
const makeTimersDb = require("./timers-db");
const ApolloClient = require("apollo-boost").default;
const gql = require("graphql-tag");
const tokenStorage = require("./tokenStorage");
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
  uri: process.env.GRAPHQL_API,
  request: async operation => {
    const token = await tokenStorage.getToken();
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ""
      }
    });
  }
});

let timerCache = null;
let isStopped = true;

async function makeDecrementDb() {
  return {
    findById,
    update
  };
  async function findById(id) {
    if (timerCache) {
      return Promise.resolve(timerCache);
    } else {
      return client
        .query({
          query: findTimerByIdQuery,
          variables: { id }
        })
        .then(({ data: { timers } }) => {
          const returnedTimer = timers[0];
          timerCache = returnedTimer;
          isStopped = false;
          return returnedTimer;
        })
        .catch(error => console.error(error));
    }
  }
  async function update(timer) {
    if (isStopped) {
      timerCache = null;
      return {
        id: timer.id,
        duration: timer.duration,
        remaining_duration: timer.remainingDuration
      };
    } else {
      timerCache = {
        id: timer.id,
        duration: timer.duration,
        remaining_duration: timer.remainingDuration
      };
      return timerCache;
    }
  }
}

async function makeStopDb() {
  return {
    findById,
    update
  };
  async function findById(id) {
    return Promise.resolve(timerCache);
  }
  async function update(timer) {
    isStopped = true;
    return client
      .mutate({
        mutation: updateTimerMutation,
        variables: {
          id: timer.id,
          remaining_duration: timer.remainingDuration
        }
      })
      .then(
        ({
          data: {
            update_timers: { returning }
          }
        }) => {
          const returnedTimer = returning[0];
          timerCache = returnedTimer;
          return returnedTimer;
        }
      )
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
          },
          refetchQueries: [{ query: findAllQuery }]
        })
        .then(result => {
          const { returning } = result.data.insert_queued_timers;
          return returning[0].timer_id == id;
        })
        .catch(error => console.error(error));
    },
    dequeue: async id => {
      return client
        .mutate({
          mutation: deleteQueuedTimerMutation,
          variables: {
            id
          },
          refetchQueries: [{ query: findAllQuery }]
        })
        .then(
          ({
            data: {
              delete_queued_timers: { affected_rows }
            }
          }) => affected_rows === 1
        )
        .catch(error => console.error(error));
    },
    findAll: async () => {
      return client
        .query({
          query: findAllQuery
        })
        .then(result => {
          const { queued_timers } = result.data;
          return queued_timers.map(({ timer_id }) => timer_id);
        })
        .catch(error => console.error(error));
    }
  };
}

const stopTimersDb = makeTimersDb({ makeDb: makeStopDb });
const decrementTimersDb = makeTimersDb({ makeDb: makeDecrementDb });
const queue = makeIdQueue({ makeQueue });

const dataAccess = Object.freeze({
  stopTimersDb,
  decrementTimersDb,
  queue
});

module.exports = dataAccess;
