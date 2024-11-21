import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Snippet,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Link } from "react-router-dom";
import { authActions, documentsActions } from "../store";

const ORIGIN = import.meta.env.VITE_API_BASE_URL;
const columns = [
  { key: "field", label: "Field" },
  { key: "value", label: "Value" },
];

const BlockChainRecordCard = ({ document, blockchainRecord, uiElements, setTimeNotification }) => {
  const dispatch = useDispatch();
  const [recordFromChainVerification, setRecordFromChainVerification] = useState({
    documentHash: "",
    verifiedAt: "",
  });

  const rows = [
    {
      key: "1",
      field: "Transaction Hash",
      value: (
        <Snippet size="sm" symbol="">
          {blockchainRecord.transactionHash}
        </Snippet>
      ),
    },
    {
      key: "2",
      field: "Document ID Hash",
      value: (
        <Snippet size="sm" symbol="">
          {blockchainRecord.documentIdHash}
        </Snippet>
      ),
    },
    {
      key: "3",
      field: "Document Hash",
      value: (
        <Snippet size="sm" symbol="">
          {blockchainRecord.documentHash}
        </Snippet>
      ),
    },
    {
      key: "4",
      field: "Block Hash",
      value: (
        <Snippet size="sm" symbol="">
          {blockchainRecord.blockHash}
        </Snippet>
      ),
    },
    {
      key: "5",
      field: "Recorded At",
      value: (
        <Snippet size="sm" symbol="">
          {new Date(blockchainRecord.recordedAt).toLocaleString("en-UK", {
            timeZone: "Asia/Kolkata",
          })}
        </Snippet>
      ),
    },
  ];
  const fetchChainVerifyRecord = async (URL) => {
    try {
      console.log(URL);
      const response = await fetch(URL, { credentials: "include" });
      console.log(response);
      const data = await response.json();
      console.log(data);

      if (response.status === 401) {
        dispatch(authActions.unsetEntity());
        dispatch(documentsActions.clearAll());
        // navigate("/login", { state: { message: "Time Out! Please log in again" } });
        return;
      }
      if (!response.ok || data.status !== "success") {
        setTimeNotification({ error: data.message }, 1.5);
        return;
      }

      setTimeNotification({ message: data.message });
      setRecordFromChainVerification({
        documentHash: data.documentHash,
        verifiedAt: data.verifiedAt,
      });
    } catch (err) {
      console.log(err);
      setTimeNotification({ error: err.message });
    }
  };
  const handleVerifyRecord = async () => {
    setTimeNotification({ loading: true });
    fetchChainVerifyRecord(`${ORIGIN}/api/documents/verify/${document.id}`);
  };
  const handleVerifyRecordManual = (e) => {
    setTimeNotification({ loading: true });
    e.preventDefault();
    const formData = new FormData(e.target);
    const documentIdHash = formData.get("documentIdHash");
    console.log(documentIdHash === blockchainRecord?.documentIdHash);

    if (!documentIdHash || documentIdHash !== blockchainRecord?.documentIdHash) {
      setTimeNotification({ error: "Please enter the correct Document ID" });
      return;
    }
    fetchChainVerifyRecord(`${ORIGIN}/api/documents/verify/${documentIdHash}?type=hash`);
  };
  return (
    <Card className="my-5">
      <CardHeader className="justify-center mt-2">
        <h3 className="text-2xl font-semibold leading-none text-default-600">Blockchain Record</h3>
        <p>
          <Link to="https://sepolia.etherscan.io/address/0x4d517fbf373ca7de4b643b7909a286c571ae13da#code">
            View on Etherscan
          </Link>
        </p>
      </CardHeader>
      <CardBody className="items-center">
        {/* Dynamic table from columns and rows array below: */}
        <Table
          aria-label="Blockchain Records Table"
          isCompact
          // isHeaderSticky
          hideHeader
          // NOTE: Header must be there with the right number of columns as cell-count, even if hidden
          removeWrapper
          classNames={{ base: "lg:w-5/6" }}
        >
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={rows}>
            {(item) => (
              <TableRow key={item.key}>
                {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Or use static Table as below too */}
        {/* <Table
          aria-label="Example table with dynamic content"
          isCompact
          // isHeaderSticky
          hideHeader
          // NOTE: Header must be there with the right number of columns as cell-count, even if hidden
          removeWrapper
          classNames={{ base: "lg:w-5/6" }}
        >
          <TableHeader>
            <TableColumn>FIELD</TableColumn>
            <TableColumn>VALUE</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow key="1">
              <TableCell>Transaction Hash</TableCell>
              <TableCell>
                <Snippet size="sm" symbol="">
                  {blockchainRecord.transactionHash}
                </Snippet>
              </TableCell>
            </TableRow>
            <TableRow key="2">
              <TableCell>Document ID Hash</TableCell>
              <TableCell>
                <Snippet size="sm" symbol="">
                  {blockchainRecord.documentIdHash}
                </Snippet>
              </TableCell>
            </TableRow>
            <TableRow key="3">
              <TableCell>Document Hash</TableCell>
              <TableCell>
                <Snippet size="sm" symbol="">
                  {blockchainRecord.documentHash}
                </Snippet>
              </TableCell>
            </TableRow>
            <TableRow key="4">
              <TableCell>Block Hash</TableCell>
              <TableCell>
                <Snippet size="sm" symbol="">
                  {blockchainRecord.blockHash}
                </Snippet>
              </TableCell>
            </TableRow>
            <TableRow key="5">
              <TableCell>Recorded At</TableCell>
              <TableCell>
                <Snippet size="sm" symbol="">
                  {new Date(blockchainRecord.recordedAt).toLocaleString("en-UK", {
                    timeZone: "Asia/Kolkata",
                  })}
                </Snippet>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table> */}
      </CardBody>
      <CardFooter className="flex-col justify-center mb-2 gap-5">
        <Button onClick={handleVerifyRecord}>Auto Verify Record</Button>
        <Form onSubmit={handleVerifyRecordManual} className="w-3/5">
          <Input
            type="text"
            name="documentIdHash"
            label="Document ID Hash"
            labelPlacement="outside"
            required
          />
          <div className="flex flex-row justify-center gap-8 pt-2">
            <Button type="submit" color="success" className="">
              Verify Manually
            </Button>
          </div>
        </Form>

        {recordFromChainVerification.documentHash && !uiElements.loading && (
          <Table
            aria-label="Verification Records Table"
            isCompact
            // isHeaderSticky
            hideHeader
            // NOTE: Header must be there with the right number of columns as cell-count, even if hidden
            removeWrapper
            classNames={{ base: "lg:w-5/6" }}
          >
            <TableHeader>
              <TableColumn>FIELD</TableColumn>
              <TableColumn>VALUE</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow key="1">
                <TableCell>Document Hash</TableCell>
                <TableCell>
                  <Snippet size="sm" symbol="">
                    {recordFromChainVerification.documentHash}
                  </Snippet>
                </TableCell>
              </TableRow>
              <TableRow key="2">
                <TableCell>Recorded At</TableCell>
                <TableCell>
                  <Snippet size="sm" symbol="">
                    {new Date(recordFromChainVerification.verifiedAt).toLocaleString("en-UK", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </Snippet>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardFooter>
    </Card>
  );
};

export default BlockChainRecordCard;
