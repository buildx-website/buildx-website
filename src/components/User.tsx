import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { UserCard } from "./UserCard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UserRoundCheck } from "lucide-react";

export function User() {
    const [name, setName] = useState("User");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function getUser() {
        setLoading(true);
        const name = localStorage.getItem("name");
        if (name) {
            setName(name);
        }
        setLoading(false);
    }

    useEffect(() => {
        getUser();
    }, [isDialogOpen]);

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
                {loading && <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>}

                {!loading && (
                    <>
                        <UserRoundCheck size={16} />
                        <span>{name}</span>
                    </>
                )}
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