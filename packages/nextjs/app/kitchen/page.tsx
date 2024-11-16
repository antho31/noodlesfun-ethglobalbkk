"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Request = {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  description: string;
  status: "pending" | "accepted" | "rejected" | "accepted_step_1";
  twitterLink?: string;
};

const incomingRequests: Request[] = [
  {
    id: 1,
    user: { name: "Alice", avatar: "/placeholder.svg?height=40&width=40" },
    description:
      "This is a long description that needs to be truncated. It contains important information about the request.",
    status: "pending",
  },
  {
    id: 2,
    user: { name: "Bob", avatar: "/placeholder.svg?height=40&width=40" },
    description: "Another long description for a different request. This one also contains crucial details.",
    status: "pending",
  },
];

const outgoingRequests: Request[] = [
  {
    id: 3,
    user: { name: "You", avatar: "/placeholder.svg?height=40&width=40" },
    description: "Your outgoing request with a detailed description.",
    status: "pending",
  },
  {
    id: 4,
    user: { name: "You", avatar: "/placeholder.svg?height=40&width=40" },
    description: "Your accepted request waiting for confirmation.",
    status: "accepted_step_1",
    twitterLink: "https://twitter.com/example/status/1234567890",
  },
];

export default function Component() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [twitterLink, setTwitterLink] = useState("");

  const handleAccept = (request: Request) => {
    setSelectedRequest(request);
    setIsAcceptModalOpen(true);
  };

  const handleReject = (requestId: number) => {
    // Implement reject logic here
    console.log("Rejected request:", requestId);
  };

  const handleSubmit = () => {
    if (twitterLink) {
      // Implement acceptance logic here
      console.log("Accepted request:", selectedRequest?.id, "with Twitter link:", twitterLink);
      setIsAcceptModalOpen(false);
      setTwitterLink("");
    }
  };

  const handleReview = (request: Request) => {
    setSelectedRequest(request);
    setIsReviewModalOpen(true);
  };

  const handleValidate = () => {
    // Implement validation logic here
    console.log("Validated request:", selectedRequest?.id);
    setIsReviewModalOpen(false);
  };

  const RequestTable = ({ requests }: { requests: Request[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map(request => (
          <TableRow key={request.id}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={request.user.avatar} alt={request.user.name} />
                  <AvatarFallback>{request.user.name[0]}</AvatarFallback>
                </Avatar>
                <span>{request.user.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="max-w-xs truncate cursor-pointer">{request.description}</div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-md p-4">
                    <p className="whitespace-normal">{request.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>{request.status}</TableCell>
            <TableCell>
              {request.status === "pending" && activeTab === "incoming" && (
                <Button variant="outline" onClick={() => handleReview(request)}>
                  Review
                </Button>
              )}
              {request.status === "accepted_step_1" && activeTab === "outgoing" && (
                <Button variant="outline" onClick={() => handleReview(request)}>
                  Review
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="w-full px-5 py-5 mb-24 md:px-16 4xl:px-4 3xl:container">
      <div className="w-full min-h-screen bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming">
            <RequestTable requests={incomingRequests} />
          </TabsContent>
          <TabsContent value="outgoing">
            <RequestTable requests={outgoingRequests} />
          </TabsContent>
        </Tabs>

        <Dialog open={isAcceptModalOpen} onOpenChange={setIsAcceptModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Request</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Label htmlFor="description">Request Description</Label>
              <p id="description" className="mt-1 text-sm text-gray-600">
                {selectedRequest?.description}
              </p>
            </div>
            <div className="mt-4">
              <Label htmlFor="twitter-link">Twitter Post Link</Label>
              <Input
                id="twitter-link"
                value={twitterLink}
                onChange={e => setTwitterLink(e.target.value)}
                placeholder="https://twitter.com/your_post"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAcceptModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!twitterLink}>
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Request</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Label htmlFor="review-description">Request Description</Label>
              <p id="review-description" className="mt-1 text-sm text-gray-600">
                {selectedRequest?.description}
              </p>
            </div>
            {activeTab === "outgoing" && (
              <div className="mt-4">
                <Label htmlFor="review-twitter-link">Twitter Post Link</Label>
                <p id="review-twitter-link" className="mt-1 text-sm text-blue-600">
                  <a href={selectedRequest?.twitterLink} target="_blank" rel="noopener noreferrer">
                    {selectedRequest?.twitterLink}
                  </a>
                </p>
              </div>
            )}
            <DialogFooter>
              {activeTab === "incoming" ? (
                <>
                  <Button variant="outline" onClick={() => handleReject(selectedRequest?.id ?? 0)}>
                    Reject
                  </Button>
                  <Button onClick={() => handleAccept(selectedRequest!)}>Accept</Button>
                </>
              ) : (
                <Button onClick={handleValidate}>Validate</Button>
              )}
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
