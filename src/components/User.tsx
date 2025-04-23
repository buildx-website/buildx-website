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