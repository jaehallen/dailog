import type { OptActionState } from "./schema";

class TimeActionStateMachine {
    private currentState: OptActionState;

    constructor(){
        this.currentState = 'end';
    }

    public state(): OptActionState {
        return this.currentState;
    }

    public start(): void {
        if(this.currentState == 'end'){
            this.currentState = 'start';
        }else{
            console.log('invalid state');
        }
    }

    public end(): void {
        if(this.currentState == 'start'){
            this.currentState = 'end';
        }else{
            console.log('invalid state');
        }
    }
}

export const timeAction = new TimeActionStateMachine();