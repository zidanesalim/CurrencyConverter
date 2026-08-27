import { Button } from "@/components/ui/button.jsx"

function SwitchButton({ onSwitch }) {
    return (
        <div className="flex flex-col justify-center items-center w-35 h-30  bg-contain">
            <Button
                onClick={onSwitch}
                variant="outline"
                size="lg"
            >
                <span>Switch</span>
            </Button>
        </div>
    )
}

export default SwitchButton