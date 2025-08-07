import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, CheckCircle, ArrowRight } from 'lucide-react'


export default function DeleteButton({
    onDelete,
    redirectTo = null,
    successDuration = 1500,
    redirectDuration = 1000,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone.",
    buttonText = "Delete",
    confirmText = "Yes, Delete",
    cancelText = "No, Cancel",
    variant = "destructive",
    size = "default",
    disabled = false,
    showIcon = true
}) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showSuccessCard, setShowSuccessCard] = useState(false)
    const [showRedirecting, setShowRedirecting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const navigate = useNavigate()
    const handleDelete = async () => {
        const deleteAction = onDelete || (() => Promise.resolve())  // fallback to a dummy promise

        console.log("Delete action initiated")

        setIsDeleting(true)

        try {
            await deleteAction()

            setShowSuccessCard(true)
            localStorage.removeItem("student")
            localStorage.removeItem("token")
            setIsDeleting(false)

            setTimeout(() => {
                if (redirectTo) {
                    setShowRedirecting(true)
                    setTimeout(() => {
                        navigate(redirectTo)
                    }, redirectDuration)
                } else {
                    setShowSuccessCard(false)
                }
            }, successDuration)

        } catch (error) {
            console.error("Delete failed:", error)
            setIsDeleting(false)
        }
    }


    return (
        <>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size={size}
                        disabled={disabled}
                        className="gap-2"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        {showIcon && <Trash2 className="w-4 h-4" />}
                        {buttonText}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                            {cancelText}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                setIsDialogOpen(false); // close dialog first
                                await handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : confirmText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Success Card Overlay */}
            {showSuccessCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-96 mx-4 animate-in slide-in-from-bottom-4 duration-500">
                        <CardContent className="p-6 text-center">
                            {!showRedirecting ? (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <CheckCircle className="w-16 h-16 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-green-600 mb-2">
                                        Successfully Deleted!
                                    </h3>
                                    <p className="text-muted-foreground">
                                        The item has been permanently removed.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <ArrowRight className="w-16 h-16 text-blue-500 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-blue-600 mb-2">
                                        Redirecting...
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Taking you to the next page.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    )
}
