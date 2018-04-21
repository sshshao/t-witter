module.exports = {
    serverPort: 5000,

    basic: {
        JWT_Secret: '9b08402877dd46f0963003b9035324be',
        Session_Duration: 86400
    },
    
    amqp: {
        AMQP_Host: 'amqp-service',
        AMQP_Exchange: 'tasks',
        AMQP_Exchange_Type: 'direct'
    },

    cassandra: {
        Cass_Host: '10.0.1.15',
        Cass_Namespace: 'media',
    },

    auth: {
        PostgreSQL_Host: 'postgres',
        PostgreSQL_User: 'postgres',
        PostgreSQL_Password: 'hyy19960529',
        PostgreSQL_DBName: 'witter',
        AMQP_Queue: 'auth_queue'
    },

    email: {
        Gmail_User: 'richackard',
        Gmail_Password: 'hyy19960529',
        AMQP_Queue: 'email_queue'
    },

    tweet: {
        Search_Limit_Default: 25,
        Search_Limit_Max: 100,
        MongoDB_Uri: 'mongodb://mongodb-node01:27017/',
        MongoDB_Name: 'witter',
        MongoDB_Collection: 'tweets',
        AMQP_Queue: 'tweet_queue'
    },

    profile: {
        Query_Limit_Default: 50,
        Query_Limit_Max: 200,
        MongoDB_Uri: 'mongodb://mongodb-node01:27017/',
        MongoDB_Name: 'witter',
        MongoDB_Collection: 'profile',
        AMQP_Queue: 'profile_queue'
    }
}