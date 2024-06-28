import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import ListJobItem from "./ListJobItem";
import { Job } from "../../App";

const JobsList = ({
  data,
  isLoading,
}: {
  data: Job[] | undefined;
  isLoading: boolean;
}) => {
  return (
    <>
      <Text
        fontSize={"4xl"}
        textTransform={"uppercase"}
        fontWeight={"bold"}
        textAlign={"center"}
        my={2}
      >
        Current Jobs
      </Text>
      {isLoading && (
        <Flex justifyContent={"center"} my={4}>
          <Spinner size={"xl"} />
        </Flex>
      )}
      {!isLoading && data?.length === 0 && (
        <Stack alignItems={"center"} gap="3">
          <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
            No Jobs Found.
          </Text>
        </Stack>
      )}
      <Stack gap={3}>
        {data?.map((job) => (
          <ListJobItem key={job.id} job={job} />
        ))}
      </Stack>
    </>
  );
};
export default JobsList;
