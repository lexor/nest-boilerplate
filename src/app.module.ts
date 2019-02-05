import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid/v4';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
// Config
import { dbConfig, authConfig } from './config';
// TypeORM
import { TypeOrmModule } from '@nestjs/typeorm';
// GQL
import { ApolloServer } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';
// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: dbConfig.pgUrl,
      entities: [__dirname + '/**/*.entity.*'],
      synchronize: true,
      cache: false,
    }),
    AuthModule,
    GraphQLModule,
    UsersModule,
  ],
  providers: [AuthModule, UsersModule],
})
export class AppModule {
  constructor(private readonly graphQLFactory: GraphQLFactory) {}

  parseAuthToken(authorization) {
    if (!authorization) {
      return null;
    }

    const authHeader = authorization.split(' ');

    if (authHeader[0].toLowerCase() != 'bearer') {
      return null;
    }

    const jwtToken = authHeader[1];

    if (!jwtToken) {
      return null;
    }

    return this.jwtValidation(jwtToken);
  }

  jwtValidation(token) {
    try {
      return jwt.verify(token, authConfig.secretKey);
    } catch (err) {
      return null;
    }
  }

  configureGraphQL(app: any, httpServer: any) {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
    const schema = this.graphQLFactory.createSchema({ typeDefs });

    const server = new ApolloServer({
      schema,
      subscriptions: {
        onConnect: (connectionParams: any) => {
          const connectionId = uuid();
          const userData = this.jwtValidation(connectionParams.accessToken);

          console.log('connect', connectionId, userData);

          return {
            connectionId,
            userData,
          };
        },
        onDisconnect: async (webSocket, context) => {
          const data = await context.initPromise;
          console.log('disconnect', data.connectionId, data.userData);
        },
      },
      context: ({ req, connection }) => {
        if (connection) {
          return connection.context;
        }

        return {
          userData: req ? this.parseAuthToken(req.headers.authorization) : null,
        };
      },
    });
    server.applyMiddleware({ app });
    server.installSubscriptionHandlers(httpServer);
  }
}
