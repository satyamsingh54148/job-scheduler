import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Job } from "../../App";

const ListJobItem = ({ job }: { job: Job }) => {
  return (
    <Flex gap={2} alignItems={"center"}>
      <Flex
        flex={1}
        alignItems={"center"}
        border={"1px"}
        borderColor={"gray.600"}
        p={2}
        borderRadius={"lg"}
        justifyContent={"space-between"}
      >
        <Text
          color={
            job.status === "pending"
              ? "grey.200"
              : job.status === "completed"
              ? "green.200"
              : "yellow.100"
          }
          textDecoration={job.status === "completed" ? "line-through" : "none"}
        >
          {job.name}
        </Text>

        <Text
          color={
            job.status === "pending"
              ? "grey.200"
              : job.status === "completed"
              ? "green.200"
              : "yellow.100"
          }
          textDecoration={job.status === "completed" ? "line-through" : "none"}
        >
          {`${job.duration} ms`}
        </Text>
        {job.status === "completed" && (
          <Badge ml="1" colorScheme="green">
            Completed
          </Badge>
        )}
        {job.status === "running" && (
          <Badge ml="1" colorScheme="yellow">
            Running
          </Badge>
        )}
        {job.status === "pending" && (
          <Badge ml="1" colorScheme="grey">
            Pending
          </Badge>
        )}
      </Flex>
      <Flex gap={2} alignItems={"center"}>
        <Box color={"green.500"} cursor={"pointer"}>
          <FaCheckCircle size={20} />
        </Box>
        <Box color={"red.500"} cursor={"pointer"}>
          <MdDelete size={25} />
        </Box>
      </Flex>
    </Flex>
  );
};
export default ListJobItem;
