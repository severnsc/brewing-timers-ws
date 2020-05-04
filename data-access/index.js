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
  request: async (operation) => {
    const token = await tokenStorage.getToken();
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
});

let timerCache = {};
let isStopped = {};

async function makeDecrementDb() {
  return {
    findById,
    update,
  };
  async function findById(id) {
    if (timerCache[id]) {
      console.log("Cache hit");
      return Promise.resolve(timerCache[id]);
    } else {
      console.log("Cache miss");
      return client
        .query({
          query: findTimerByIdQuery,
          variables: { id },
          fetchPolicy: "network-only",
        })
        .then(({ data: { timers } }) => {
          const returnedTimer = timers[0];
          timerCache[id] = returnedTimer;
          isStopped[id] = false;
          return returnedTimer;
        })
        .catch((error) => console.error(error));
    }
  }
  async function update(timer) {
    if (isStopped[timer.id]) {
      return {
        id: timer.id,
        duration: timer.duration,
        remaining_duration: timer.remainingDuration,
      };
    } else {
      timerCache[timer.id] = {
        id: timer.id,
        duration: timer.duration,
        remaining_duration: timer.remainingDuration,
      };
      return timerCache[timer.id];
    }
  }
}

async function makeStopDb() {
  return {
    findById,
    update,
  };
  async function findById(id) {
    return Promise.resolve(timerCache[id]);
  }
  async function update(timer) {
    return client
      .mutate({
        mutation: updateTimerMutation,
        variables: {
          id: timer.id,
          remaining_duration: timer.remainingDuration,
        },
      })
      .then(
        ({
          data: {
            update_timers: { returning },
          },
        }) => {
          const returnedTimer = returning[0];
          isStopped[timer.id] = true;
          timerCache[timer.id] = null;
          return returnedTimer;
        }
      )
      .catch((error) => console.error(error));
  }
}

/* async function makeQueue() {
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
} */
let queue = {};
function makeMakeQueue({ decrementTimer }) {
  return function makeQueue() {
    return {
      enqueue: async ({ id, sendResponse }) => {
        async function cron({ id, res }) {
          try {
            const decremented = await decrementTimer({ id });
            res.send(decremented.remainingDuration);
          } catch (e) {
            console.error(e);
            res.send(e.message);
          }
        }
        queue[id] = true;
        setTimeout(function run() {
          if (queue[id]) {
            cron({ id, res: sendResponse });
            setTimeout(run, 1000);
          }
        }, 1000);
        return Promise.resolve(true);
      },
      dequeue: async (id) => {
        queue[id] = false;
        return Promise.resolve(true);
      },
      findAll: async () => {
        return Promise.resolve(queue);
      },
    };
  };
}

const stopTimersDb = makeTimersDb({ makeDb: makeStopDb });
const decrementTimersDb = makeTimersDb({ makeDb: makeDecrementDb });

const dataAccess = Object.freeze({
  stopTimersDb,
  decrementTimersDb,
  makeMakeQueue,
  makeIdQueue,
});

module.exports = dataAccess;
