import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { forwardRef } from "react";

const RejectDocModalButton = forwardRef(
  ({ uiElements, handleUpdateDocStatus }, rejectReasonRef) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
      <>
        <Button type="button" color="danger" onPress={onOpen}>
          Reject
        </Button>
        <Modal
          backdrop="opaque"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          // onClose={cleanupOnCloseModal}
          size="2xl"
          classNames={{
            backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          }}
        >
          <ModalContent>
            {(closeModal) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Enter Rejection Reason</ModalHeader>
                <ModalBody className="flex flex-col gap-4 text-center">
                  {uiElements.loading && (
                    <div className="bg-primary rounded-lg py-2 px-4">
                      <p>Processing! Please wait</p>
                    </div>
                  )}
                  {uiElements.error && (
                    <div className="bg-danger rounded-lg py-2 px-4">
                      <p>{uiElements.error}</p>
                    </div>
                  )}
                  {uiElements.message && (
                    <div className="bg-success rounded-lg py-2 px-4">
                      <p>{uiElements.message}</p>
                    </div>
                  )}
                  <Input
                    type="text"
                    name="rejectReason"
                    label="Reason for Rejection"
                    ref={rejectReasonRef}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="button"
                    color="danger"
                    // variant="light"
                    onClick={(e) => handleUpdateDocStatus("Rejected")}
                  >
                    Reject
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }
);

RejectDocModalButton.displayName = "RejectDocModalButton"; // Removes eslint raises react/display-name error

export default RejectDocModalButton;
