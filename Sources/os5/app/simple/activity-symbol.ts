import * as utils from "./utils";
import { Activity } from "simple-fitbit-activities";

/**
 * Class to manage activity symbol
 */
export class ActivitySymbol {
    /**
     * Symbol managed by this class
     */
    protected _symbol: GraphicsElement;
    protected _appBackground: GraphicsElement
    protected _activity: Activity;

    constructor(symbol: GraphicsElement, appBackground: GraphicsElement) {
        this._symbol = symbol;
        this._appBackground = appBackground;
        this._activity = new Activity(undefined, undefined);
    }

    /**
     * Change class name (to change control usage)
     * @param classNames class property to affect to arcs
     */
    public setStyleAndEvent(classNames: string, imageUri: string): void {
        // Set class and refresh colors
        this._symbol.class = classNames;
        // Set image
        let image = this._symbol.getElementById("image") as ImageElement;
        image.href = imageUri;
    }

    /**
     * Set the activity values
     * @param activity 
     */
    set(activity: Activity): void {
        // Update only if activity is set
        if (activity === undefined) return;
        // Goal was reached?
        const goalReached = this._activity.goalReached();

        // Update cache
        this._activity = activity;

        // update the UI
        this.refresh();

        // Animation if state changed
        if (activity.goalReached() && !goalReached) utils.highlight(this._symbol);
    }

    public refresh(): void {
        let arc = this._symbol.getElementById("arc") as ArcElement; // First Arc is used for background
        let arcBack = this._symbol.getElementById("arc-back") as ArcElement;
        let circle = this._symbol.getElementById("circle") as CircleElement;
        let image = this._symbol.getElementById("image") as ImageElement;

        // Goals ok
        if (this._activity.goalReached()) {
            utils.fill(circle, "gold");
            utils.hide(arcBack);
            utils.hide(arc);
            utils.fill(image, this._appBackground.style.fill);
        }
        else {
            utils.fill(circle, this._appBackground.style.fill);
            utils.show(arcBack);
            utils.show(arc);
            arc.sweepAngle = this._activity.as360Arc(); //util.activityToAngle(activity.goal, activity.actual);
            utils.fill(image, this._symbol.style.fill);
        }
    }

    /**
     * Call it to highlight the symbol when display go on if goal was reached
     */
    public onDiplayGoOn(): void {
        // Test if cache was set
        if (this._activity === undefined) return;
        // Test if goel was reached
        if (this._activity.goalReached()) utils.highlight(this._symbol);
    }

    /**
     * Hide the symbol
     */
    public hide(): void {
        utils.hide(this._symbol);
    }
}