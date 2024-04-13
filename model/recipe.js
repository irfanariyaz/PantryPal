/**@module model/recipe */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**A Schema object for the Recipe Model
 * @author Tyler Del Rosario
 * @property route_id {string} A unique 11 character string that must be generated by
 * <a href="module-model_RouteID.html">RouteID</a>
 * @property name {string} The name for the recipe
 * @property instructions {array} An array of ObjectIDs that reference Instruction.
 * @property ingredients {array} An array of ObjectIDs that reference Ingredient.
 */
const RecipeSchema = new Schema({
    route_id: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    // instructions: [{type: Schema.Types.ObjectId, ref:"Instruction"}],
    instructions:[{type:String}],
    ingredients: [{type: Schema.Types.ObjectId, ref:"RecipeIngredient"}],
    measurements:[{type:String}],
    category: {
        type: String,
        enum: ["Beef","Chicken", "Dessert", "Lamb","Miscellaneous", "Pasta", "Pork",
        "Seafood", "Side","Starter","Vegan", "Vegetarian","Breakfast", "Goat",],
        required: true
    },
    image:{type:String}
    // prep_time: {type: Number, required: true},
    // cook_time: {type: Number, required: true}
});

RecipeSchema.virtual("url").get(function() {
    return `/recipe/${this._id}`;
});

export default mongoose.model("Recipe", RecipeSchema);