"use client";

import Autoplay from "embla-carousel-autoplay";
import { DollarSign, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data
export const featuredCreators = [
  {
    id: 1,
    name: "Elon Musk",
    image: "https://pbs.twimg.com/profile_images/1849727333617573888/HBgPUrjG_400x400.jpg",
    price: "69,420$",
    description: "CEO of Tesla, SpaceX, Neuralink, and The Boring Company",
    tags: ["Entrepreneur", "Innovator"],
  },
  {
    id: 2,
    name: "Vitalik Buterin",
    image: "https://pbs.twimg.com/profile_images/1748153260203229184/sXJIGMBk_400x400.jpg",
    price: "2 ETH",
    description: "Co-founder of Ethereum",
    tags: ["Blockchain", "Cryptocurrency"],
  },
  {
    id: 3,
    name: "Ansem",
    image: "https://pbs.twimg.com/profile_images/1847482699805597696/ZhvERGEx_400x400.jpg",
    price: "100$",
    description:
      "coldest nigga breathing | @BullpenFi | telegram @blknoiz06 | ig @blknoiz_06 | all other clone accounts are scams",
    tags: ["MemeCoins", "KOL"],
  },
  {
    id: 4,
    name: "mitch (rtrd/acc)",
    image: "https://pbs.twimg.com/profile_images/1774942228630134784/tzr1yvLR_400x400.jpg",
    price: "100,000$",
    description: "CEO of retardios",
    tags: ["KOL"],
  },
  {
    id: 5,
    name: "mert",
    image: "https://pbs.twimg.com/profile_images/1775535430835863552/zgFeCArT_400x400.jpg",
    price: "50$",
    description: "dev at helios",
    tags: ["dev"],
  },
  {
    id: 6,
    name: "ram",
    image: "https://pbs.twimg.com/profile_images/1778954511349903360/kBSJNkBx_400x400.jpg",
    price: "145$",
    description: "expert meme speculator.",
    tags: ["KOL"],
  },
  {
    id: 7,
    name: "dxrnelljcl",
    image: "https://pbs.twimg.com/profile_images/1837951259971579904/3bcI8tP2_400x400.jpg",
    price: "145$",
    description: "TAG TRADER",
    tags: ["KOL"],
  },
];

const latestActivities = [
  {
    id: 1,
    username: "user1",
    avatar: "/placeholder.svg?height=40&width=40",
    action: "buy",
    creator: "Alice",
    price: 120,
    time: "2 minutes ago",
  },
  {
    id: 2,
    username: "user2",
    avatar: "/placeholder.svg?height=40&width=40",
    action: "sell",
    creator: "Bob",
    price: 150,
    time: "5 minutes ago",
  },
  {
    id: 3,
    username: "user3",
    avatar: "/placeholder.svg?height=40&width=40",
    action: "redeem",
    creator: "Charlie",
    price: 100,
    time: "10 minutes ago",
  },
  {
    id: 4,
    username: "user4",
    avatar: "/placeholder.svg?height=40&width=40",
    action: "buy",
    creator: "Diana",
    price: 200,
    time: "15 minutes ago",
  },
  {
    id: 5,
    username: "user5",
    avatar: "/placeholder.svg?height=40&width=40",
    action: "sell",
    creator: "Emma",
    price: 180,
    time: "20 minutes ago",
  },
];

export default function Home() {
  return (
    <div className="w-full px-5 py-5 mb-24 md:px-16 4xl:px-4 3xl:container">
      <div className="">
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold">Featured Creators</h2>
          <Carousel
            opts={{
              loop: true,
              align: "start",
              // slidesToScroll: "auto",
              dragFree: true,
            }}
            plugins={[
              Autoplay({
                playOnInit: true,
                delay: 2500,
              }),
            ]}
          >
            <CarouselContent className="">
              {featuredCreators.map(creator => (
                <CarouselItem key={creator.id} className="qwertyuiop basis-[272px]">
                  <Card className="flex-shrink-0 w-64 h-full overflow-hidden select-none group">
                    <CardContent className="relative h-full p-0 overflow-hidden">
                      <img src={creator.image} alt={creator.name} className="object-cover w-full h-64" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{creator.name}</h3>
                        <p className="text-sm font-bold">${creator.price}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{creator.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {creator.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 group-hover:bg-opacity-50">
                        <Button className="transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                          Trade Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </section>

        {/* Latest Activity Section */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Latest Activity</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestActivities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={activity.avatar} alt={activity.username} />
                        <AvatarFallback>{activity.username.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span>{activity.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.action === "buy" && <DollarSign className="inline w-4 h-4 mr-1 text-green-500" />}
                    {activity.action === "sell" && <TrendingUp className="inline w-4 h-4 mr-1 text-red-500" />}
                    {activity.action === "redeem" && <DollarSign className="inline w-4 h-4 mr-1 text-blue-500" />}
                    {activity.action}
                  </TableCell>
                  <TableCell>{activity.creator}</TableCell>
                  <TableCell>${activity.price}</TableCell>
                  <TableCell>{activity.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
