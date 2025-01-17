/**@module model/fridge*/
import mongoose from "mongoose";
import User from "./user.js";
const Schema = mongoose.Schema;

/**
 * Schema object for the Fridge model. May also be called Pantry object.
 * @author Tyler Del Rosario
 * @property route_id {ObjectID} A unique 11 character string that must be generated by
 * <a href="module-model_RouteID.html">RouteID</a>
 * @property owner_id {ObjectID} An ObjectID that references a user within the user document.
 * @property ingredients {array} A list of ObjectIDs that references ingredients from the ingredient document.
 */
const FridgeSchema = new Schema({
    routeID: {type: String, required: true, unique: true},
    owner_id: {type: Schema.Types.ObjectId, ref: "User", required: true},
    ingredients: [{type: Schema.Types.ObjectId, ref: "FridgeIngredient"}],
    meal_plan: [{type: Schema.Types.ObjectId, ref: "Meal"}]
});

FridgeSchema.virtual("url").get(function() {
    return `/fridge/${this._id}`;
});

export default mongoose.model("Fridge", FridgeSchema);