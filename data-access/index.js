const makeIdQueue = require("./queue");
const makeTimersDb = require("./timers-db");
const ApolloClient = require("apollo-boost").default;
const gql = require("graphql-tag");
const tokenStorage = require("./tokenStorage");
require("cross-fetch/polyfill");

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
let queue = {};
async function makeStopDb() {
  return {
    findById,
    update,
  };
  async function findById(id) {
    return Promise.resolve(queue[id]);
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
          return returnedTimer;
        }
      )
      .catch((error) => console.error(error));
  }
}
async function makeDecrementDb() {
  return {
    findById,
    update,
  };
  async function findById(id) {
    const found = queue[id];
    return {
      ...found,
      remaining_duration: found.remainingDuration,
    };
  }
  async function update(timer) {
    queue[timer.id] = {
      ...queue[timer.id],
      remainingDuration: timer.remainingDuration,
    };
    return {
      id: timer.id,
      duration: timer.duration,
      remaining_duration: timer.remainingDuration,
    };
  }
}
function makeMakeQueue({ decrementTimer }) {
  return function makeQueue() {
    return {
      enqueue: async ({ id, duration, sendResponse }) => {
        async function cron({ id, res }) {
          try {
            const decremented = await decrementTimer({ id });
            res.send(decremented.remainingDuration);
          } catch (e) {
            console.error(e);
            res.send(e.message);
          }
        }
        queue[id] = {
          id,
          duration: Number(duration),
          remainingDuration: Number(duration),
        };
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
