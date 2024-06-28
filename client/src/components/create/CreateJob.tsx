import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { ENDPOINT, Job } from "../../App";
import { KeyedMutator } from "swr";
import { MdAddTask } from "react-icons/md";

const CreateJob = ({ mutate }: { mutate: KeyedMutator<Job[]> }) => {
  const [jobTitle, setNewJobTitle] = useState<string>("");
  const [jobDuration, setNewJobDuration] = useState<number>();
  const [isPending, setIsPending] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function createJob() {
    setIsPending(true);
    const updated = await fetch(`${ENDPOINT}/api/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: jobTitle, duration: jobDuration }),
    }).then((r) => r.json());

    mutate(updated);
    setNewJobTitle("");
    setNewJobDuration(undefined);
    setIsPending(false);
    onClose();
  }

  return (
    <>
      <Button
        leftIcon={<MdAddTask />}
        colorScheme="pink"
        variant="solid"
        m={2}
        onClick={onOpen}
      >
        Create a Job.
      </Button>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form>
              <Flex gap={2} direction="column">
                <Input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="Enter Name of the Job"
                  isRequired
                />
                <InputGroup>
                  <Input
                    type="number"
                    value={jobDuration}
                    onChange={(e) => setNewJobDuration(e.target.valueAsNumber)}
                    placeholder="Duration in Milliseconds"
                    isRequired
                  />
                  <InputRightAddon>ms</InputRightAddon>
                </InputGroup>
              </Flex>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button mx={2} onClick={createJob} isDisabled={isPending}>
              {isPending ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
              {isPending ? " Creating" : " Create"}
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default CreateJob;
