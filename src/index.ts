import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
const cors = require("cors");

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
} from "graphql";

admin.initializeApp();

const app = express();
let db = admin.firestore();
app.use(cors({ origin: true }));

const snapshotToArray = (snapshot: any) => {
  var returnArr: any = [];

  snapshot.forEach((childSnapshot: any) => {
    var item = childSnapshot.data();

    console.log(item);
    returnArr.push(item);
  });

  return returnArr;
};
const SearchType = new GraphQLObjectType({
  name: "Search",
  fields: () => ({
    userId: {
      type: GraphQLString,
    },
    search: {
      type: GraphQLString,
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    search: {
      type: new GraphQLList(SearchType),
      args: { id: { type: GraphQLString } },
      resolve(parent: any, args: any) {
        let result: any = db
          .collection("search")
          .where("userId", "==", args.id)
          .get()
          .then((snap: any) => {
            return snapshotToArray(snap);
          })
          .catch((err: any) => {
            console.log("Error getting documents", err);
          });
        return result;
      },
    },
  },
});
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addSearch: {
      type: SearchType,
      args: {
        userId: { type: GraphQLString },
        search: { type: GraphQLString },
      },
      resolve(parent: any, args: any) {
        db.collection("search")
          .add({
            userId: args.userId,
            search: args.search,
          })
          .then((result: any) => {
            console.log(result);
          })
          .catch((error: any) => {
            console.log(error);
          });
      },
    },
  },
});
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

exports.graph = functions.https.onRequest(app);

// // Start writing Firebase ad
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
