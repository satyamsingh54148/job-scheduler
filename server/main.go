package main

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gorilla/websocket"
)

type Jobs struct {
	ID       int           `json:"id"`
	Name     string        `json:"name"`
	Duration time.Duration `json:"duration"`
	Status   string        `json:"status"`
}

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
	jobs     = []Jobs{}
	wsConns  = make(map[*websocket.Conn]bool)
	jobQueue = make(chan Jobs, 10) // adding a buffer of 10 jobs in the go channel.
	jobsMux  sync.Mutex
)

func echoHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()
	wsConns[conn] = true

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			delete(wsConns, conn)
			return
		}
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println(err)
			delete(wsConns, conn)
			return
		}
	}
}

func notifyClients(job Jobs) {
	for conn := range wsConns {
		err := conn.WriteJSON(job)
		if err != nil {
			log.Println("WebSocket write error:", err)
			delete(wsConns, conn)
		}
	}
}

func SJFSchedule() {
	for {
		jobsMux.Lock()

		if len(jobs) == 0 {
			jobsMux.Unlock()
			time.Sleep(1 * time.Second)
			continue
		}

		// Find the shortest pending job
		var shortestJob *Jobs
		for i := range jobs {
			if jobs[i].Status == "pending" {
				if shortestJob == nil || jobs[i].Duration < shortestJob.Duration {
					shortestJob = &jobs[i]
				}
			}
		}

		if shortestJob != nil {
			// Update job status to "running"
			shortestJob.Status = "running"
			notifyClients(*shortestJob)
			jobQueue <- *shortestJob

			jobsMux.Unlock()
			time.Sleep(shortestJob.Duration * time.Millisecond) // Simulate job execution
			jobsMux.Lock()

			// Update job status to "completed"
			for i := range jobs {
				if jobs[i].ID == shortestJob.ID {
					jobs[i].Status = "completed"
					notifyClients(jobs[i])
					break
				}
			}
		}
		jobsMux.Unlock()
		time.Sleep(1 * time.Second)
	}
}

func main() {

	// Initialize Fiber app
	app := fiber.New()

	// Fiber middleware - CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// REST API endpoints
	// POST endpoint
	app.Post("/api/create", func(c *fiber.Ctx) error {
		job := &Jobs{}

		err := c.BodyParser(job)
		if err != nil {
			return err
		}
		jobsMux.Lock()
		job.ID = len(jobs) + 1
		job.Status = "pending"
		jobs = append(jobs, *job)
		jobsMux.Unlock()

		return c.JSON(jobs)
	})

	// GET endpoint
	app.Get("/api/list", func(c *fiber.Ctx) error {
		jobsMux.Lock()
		defer jobsMux.Unlock()
		return c.JSON(jobs)
	})

	// Start Fiber server
	go func() {
		log.Fatal(app.Listen(":4000"))
	}()

	// Start WebSocket server
	go func() {
		http.HandleFunc("/ws", echoHandler)
		log.Fatal(http.ListenAndServe(":8080", nil))
	}()

	// Start SJF Scheduler
	go SJFSchedule()

	// Prevent main from exiting
	select {}
}
