import "./App.css";
import { Container, Stack } from "@chakra-ui/react";
import CreateJob from "./components/create/CreateJob";
import JobsList from "./components/list/JobsList";
import { useEffect, useState } from "react";
import useSWR from "swr";

export interface Job {
  id: number;
  name: string;
  duration: number;
  status: string;
}

export const ENDPOINT = "http://localhost:4000";
const WS_ENDPOINT = "ws://localhost:8080/ws";

const fetcher = async (url: string) => {
  const response = await fetch(`${ENDPOINT}/${url}`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

function App() {
  const { data, error, mutate } = useSWR<Job[]>("api/list", fetcher);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // setting initial values upon fetching from API
  useEffect(() => {
    if (data !== undefined) {
      setJobs(data);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [data]);

  // Establishing WebSocket Connection
  useEffect(() => {
    const ws = new WebSocket(WS_ENDPOINT);

    ws.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    ws.onmessage = (message: any) => {
      const updatedJob: Job = JSON.parse(message.data);
      setJobs((prevJobs) => {
        const jobIndex = prevJobs.findIndex((job) => job.id === updatedJob.id);
        if (jobIndex !== -1) {
          const updatedJobs = [...prevJobs];
          updatedJobs[jobIndex] = updatedJob;
          return updatedJobs;
        } else {
          return [...prevJobs, updatedJob];
        }
      });
    };

    ws.onclose = () => {
      console.log("WebSocket Client Disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  if (error) {
    return <div>Error loading jobs</div>;
  }

  return (
    <Stack h="100vh">
      <Container>
        <JobsList data={jobs} isLoading={isLoading} />
        <CreateJob mutate={mutate} />
      </Container>
    </Stack>
  );
}

export default App;
