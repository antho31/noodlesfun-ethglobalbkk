import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInputSK,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const autocomplete = [
  {
    handle: "noodlesdotfun",
    img: "https://pbs.twimg.com/profile_images/1857646465558134784/WAd2HZ-6_400x400.png",
  },
  {
    handle: "VitalikButerin",
    img: "https://pbs.twimg.com/profile_images/1748153260203229184/sXJIGMBk_400x400.jpg",
  },
  {
    handle: "elonmusk",
    img: "https://pbs.twimg.com/profile_images/1849727333617573888/HBgPUrjG_400x400.jpg",
  },
];

export const SearchBar = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  //   const [query, setQuery] = useState("");
  //   const debouncedQuery = useDebounce(query, 100);

  //   const { data, error, status } = useQuery({
  //     queryKey: ["search", debouncedQuery],
  //     queryFn: async () => {
  //       const res = await fetch(`/api/profile/${debouncedQuery}`, {
  //         cache: "force-cache",
  //         next: {
  //           revalidate: 60 * 60 * 24,
  //         },
  //       }).then(res => res.json());

  //       console.log(res);

  //       return res;
  //     },
  //     enabled: !!debouncedQuery,
  //   });

  //   useEffect(() => {
  //     const onInput = async () => {
  //       setQuery(inputRef.current?.value || "");
  //     };

  //     inputRef.current?.addEventListener("change", onInput);
  //     return () => inputRef.current?.removeEventListener("change", onInput);
  //   }, [open]);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        inputRef.current?.blur();
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !open) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  return (
    <Command
      className={cn("relative overflow-visible bg-card outline-input h-10", className, {
        outline: open,
      })}
      loop
    >
      <CommandInputSK
        placeholder="Search"
        className="h-10"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        ref={inputRef}
      />
      {open && (
        <CommandList className="absolute w-full mt-0 rounded-md shadow-md outline-none top-12 bg-card animate-in fade-in-0 zoom-in-95">
          <CommandEmpty>Search for query</CommandEmpty>
          <CommandGroup heading="Trending">
            {autocomplete.map(item => (
              <CommandItem
                key={item.handle}
                onSelect={() => {
                  router.push(`/profile/${item.handle}`);
                  inputRef.current?.blur();
                }}
              >
                <Image src={item.img} className="w-6 h-6 mr-2 rounded-full" alt={item.handle} width={24} height={24} />
                <span>{item.handle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
};
