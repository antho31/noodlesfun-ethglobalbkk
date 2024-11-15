import { useEffect, useRef, useState } from "react";
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

export const SearchBar = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Trending">
            <CommandItem>
              <Calendar className="w-4 h-4 mr-2" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile className="w-4 h-4 mr-2" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator className="w-4 h-4 mr-2" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          {/* <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem>
                            <User className="w-4 h-4 mr-2" />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <CreditCard className="w-4 h-4 mr-2" />
                            <span>Billing</span>
                            <CommandShortcut>⌘B</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <Settings className="w-4 h-4 mr-2" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup> */}
        </CommandList>
      )}
    </Command>
  );
};
