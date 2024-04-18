# what is Redis Cache

Redis is an in-memory data structure that is used for faster access to data. It is used to store data that needs to be accessed frequently and fast. It is not used for storing large amounts of data. If you want to store and retrieve large amounts of data you need to use a traditional database such as MongoDB or MYSQL. Redis provides a variety of data structures such as sets, strings, hashes, and lists.

Redis is a popular in-memory key-value database. Unlike traditional databases that run on a computer’s hard disk and store all of their data on disk, Redis runs inside of a system’s working memory (RAM). This allows Redis to be incredibly fast at fetching data, which is why it’s often used as a cache on top of other databases to improve application performance.

## How to use Redis Cache

#### Installation


A. How to install Redis on Linux
Most major Linux distributions provide packages for Redis.


Install on Ubuntu/Debian

1. Update APT Repository
Redis is already included in the official package repository of Ubuntu. Nevertheless, we recommend to frequently update the APT repository to get the latest version possible.

> sudo apt-get update

2. Install Redis Server on Ubuntu Using the APT Command
sudo apt install redis
Press “y” and then hit Enter to continue.

3. Check the Redis Version
Once Redis is installed, you can check if the installation was successful by using this command:

> redis-cli --version

The output will display the version of the Redis server currently installed on your machine.

4. Start Redis Service
Once the installation is complete, we recommend checking if the Redis instance is running. In order to test connectivity, you can use the following command:

> sudo systemctl status redis

5. Then, log in to the Redis command-line client:

> redis-cli

Working - How to set and get data in redis


> SET Key Value

> GET key

```bash
user@aasif-iqbal:~$ redis-cli
127.0.0.1:6379> SET blog_data "title:How to work with redis"
OK
127.0.0.1:6379> GET blog_data
"title:How to work with redis"
```
#

B. How to install in Mac os
First, make sure you have Homebrew installed. From the terminal, run:

> brew --version  
- If this command fails, you'll need to install [Homebrew](https://brew.sh/)

Installation - From the terminal, run:

> brew install redis

This will install Redis on your system.

Starting and stopping Redis in the foreground
To test your Redis installation, you can run the redis-server executable from the command line:

> redis-server

If successful, you'll see the startup logs for Redis, and Redis will be running in the foreground.

To stop Redis, enter Ctrl-C.
### Starting and stopping Redis using launchd
As an alternative to running Redis in the foreground, you can also use launchd to start the process in the background:

> brew services start redis

You can check the status of a launchd managed Redis by running the following:
> brew services info redis

If the service is running, you'll see output like the following:

```bash
redis (homebrew.mxcl.redis)
Running: ✔
Loaded: ✔
User: miranda
PID: 67975
```
To stop the service, run:
> brew services stop redis

### Connect to Redis
Once Redis is running, you can test it by running redis-cli:
> redis-cli

This will open the Redis REPL. Try running some commands:

```bash
127.0.0.1:6379> lpush demos redis-macOS-demo
OK
127.0.0.1:6379> rpop demos
"redis-macOS-demo"
```


C. In Windows
You can watch YouTube video CodeByHeart - By Shyed Azhar 
[How to install  Redis in windows](www.youtube.com)
```bash
redis-cli 
127.0.0.1:6379> ping
PONG
```

## Installing Redis Cache in Our Nodejs App

Open terminal:
> npm install redis

> npm install @types/redis

How to use it :
In app.ts

1. Create Connection

```js
import * as redis from "redis";

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();
```
2. How to Use redis in Nodejs App

```js
const _createRedisClient = async () => {
  
  const client = await redis.createClient();
  
  client.on('error', (err) => {
      console.error('Redis connection error:', err);
  });
  // Additional initialization or setup logic can go here
  return client;
}

const getQuiz: RequestHandler = async (req, res, next) => {
 
 try { 
    const redisClient = await _createRedisClient();
        
        await redisClient.connect();
        
        //get data from cache-memory
        let redisCache = await redisClient.get(JSON.stringify('my_key'));            
    
        if(redisCache){
            // fetch from redis-cache
            return redisCache;
        }else{        
            // if cache is null(missing) - Fetch from database
            const quiz = await Quiz.find({});
            
            // set quiz data in redis cache with unique key
            await redisClient.set(JSON.stringify('my_key'), JSON.stringify(quiz));      

            return quiz;
        }        
    } catch(err){
        next(error);
    } 
}
```
> Note: Make Sure, After every Operations(such as Create, update, delete) We need to ERASE the cache-memory, So that we get updated cache value.

### When to use Redis Cache

Redis cache can be used in your application to improve performance and reduce the load on your primary data store (such as a database or an API). Here are some common scenarios where Redis cache can be beneficial:

- Frequent Read Operations: If your application frequently reads data that doesn't change often, you can cache the results in Redis. This reduces the need to fetch the data from the primary data store every time, improving response times and reducing latency.

- Highly Accessed Data: Caching frequently accessed data in Redis helps reduce the load on your primary data store and can improve overall system performance. This is especially useful for data that is accessed by many users simultaneously.

- Session Management: Storing session data in Redis allows you to easily scale your application across multiple servers or instances. Redis provides fast read and write operations, making it ideal for storing session information.

- API Response Caching: If your application consumes data from external APIs, you can cache the responses in Redis to reduce latency and improve performance. This is particularly useful for APIs that have rate limits or slow response times.

- Result Caching: Cache the results of expensive calculations or complex operations to avoid repeating the same computations. This can significantly improve the performance of your application, especially for CPU-intensive tasks.

- Distributed Locks and Semaphores: Redis provides primitives like locks and semaphores that can be used for synchronization and coordination in distributed systems. This is useful for scenarios where you need to ensure mutual exclusion or limit access to a shared resource.

- Real-Time Data: Use Redis for real-time data processing and analytics. Redis supports data structures like streams and pub/sub, making it suitable for building real-time messaging systems, chat applications, and event-driven architectures.

Overall, Redis cache can be used in various parts of your application to improve performance, scalability, and reliability. It's important to identify the specific use cases and requirements of your application and determine where Redis caching can provide the most benefit.


[Insight Form - view dashboard](https://redis.io/insight/#insight-form)

### Some common redis cmd
- Open terminal
> redis-cli

Set Password Authentication
> AUTH YourPassword

Get all keys
> KEYS *

Delete keys
> DEL key

FLUSHALL: Delete all keys from all databases.
> FLUSHALL

