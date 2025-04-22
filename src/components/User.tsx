import {  useState } from "react";
import { Button } from "./ui/button";
import { UserCard } from "./UserCard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UserRoundCheck } from "lucide-react";
import type { User } from "better-auth";

export function User({ user }: { user: User | null }) {
    const name = user?.name || "User";
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    function handleClick() {
        setIsDialogOpen(true);
    }

    return (<>
        <div className="p-0">
            <Button
                variant="outline"
                className="flex items-center gap-2 border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-400 hover:text-slate-200 hover:bg-[length:220%_100%] transition-colors justify-center"
                onClick={handleClick}
            >
                <UserRoundCheck size={16} />
                <span>{name}</span>

            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTitle />
                <DialogContent>
                    <UserCard setIsDialogOpen={setIsDialogOpen} />
                </DialogContent>
            </Dialog>
        </div>
    </>
    )
}