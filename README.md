Built a Job-scheduler with Go and React which uses SJF scheduling Algorithm

What are we using?

Go - Server

Fiber - Go web server

gorilla/websocket - server websocket connection

React - Client

Chakra-ui - React component library

swr - React hook for data fetching

websocket - client websocket connection

TypeScript - Static types

How to Run?

Client will run at http://localhost:3000
Server is listening at http://localhost:4000
websocket is being connected at ws://localhost:8080/ws

for React client - 

cd client

// To download dependencies

yarn install

// To start Client

yarn start

for Golang server -

cd server

// To download the dependencies

go mod download

// To start the server

go run main.go



Design choices and approach

For implementation of Shortest Job First scheduling algorithm, a function is being used to periodically check for pending jobs and add them to the gochannel. Then for the duration of the job, the execution is made to sleep to replicate the process being done. Whenever the status of a job is changed, the job is sent to the client via the websocket connection and it is appropiately reflected in the client-side.
