import mongoose from 'mongoose';
import Fridge from '../model/fridge.js';
import Ingredient from '../model/ingredient.js';
import FridgeIngredient from '../model/fridge_ingredient.js';
import Recipe from '../model/recipe.js';
import Meal from '../model/meal.js';
import "dotenv/config";

const FridgeController = () => {

    async function addFridgeIngredient(req, res) {
        const fridgeID = req.body.routeID;
        const ingredientID = req.body.ingredientID;
        const measurement = req.body.measurement;
        const amount = req.body.amount;

        if (fridgeID === null || ingredientID === null || measurement === null || amount === null) {
            res.status(400).send("Incomplete form data");
        }

        let success = false;

        await mongoose.connect(process.env.DB_URL).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });

        const fridge = await Fridge.findOne({routeID: fridgeID}).exec().catch((error) => {
            console.error(error);
        });

        const ingredient = await Ingredient.findOne({fdc_id: ingredientID}).exec().catch((error) => {
            console.error(error);
        });

        if (ingredient === null || fridge === null) {
            res.status(400).send("ingredientID or fridgeID missing from query").send();
        }

        const fridgeIngredient = new FridgeIngredient({
            fridgeID: fridge._id,
            ingredientID: ingredient._id,
            measurement: measurement,
            amount: amount
        });

        await fridgeIngredient.save().then(() => {
            success = true;
        }).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
 
        mongoose.disconnect();
        if (success) {
            res.status(200).send("Success");
        } else {
            res.status(500).send("Creation failed");
        }
    }

    async function removeFridgeIngredient(req, res) {
        const ingredientID = req.body.ingredientID;
        await mongoose.connect(process.env.DB_URL).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });

        await FridgeIngredient.deleteOne({_id: ingredientID}).exec().then(() => {
            res.status(200).send("Deletion successful");
        }).catch((error) => {
            console.error(error);
            res.status(400).send("Ingredient not found.");
        });
    }

    //
    async function readAllFridgeIngredients(req, res) {
        const fridgeID = req.query.fridgeID;
        await mongoose.connect(process.env.DB_URL).then( async () => {
            await FridgeIngredient.find({fridgeID: fridgeID}).lean().exec().then(async (pantry) => {
                for await (const ingr of pantry) {
                    const item = await Ingredient.findById(ingr.ingredientID).exec().then((data) => {
                        ingr.name = data.name;
                        ingr.nutrients = data.nutrients;
                    }).catch((error) => {
                        console.error(error);
                        res.status(500).send();
                    });
                }

                //Needs to be sorted since order isn't consistent.
                res.json(pantry.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                }));
            }).catch((error) => {
                console.error(error);
                res.status(400).send("Ingredients not found.");
            });
        }).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
    }

    async function incrementIngredient(req, res) {
        const ingredientID = req.body.ingredientID;
        console.log(ingredientID);
        await mongoose.connect(process.env.DB_URL).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });

        await FridgeIngredient.findOneAndUpdate({_id: ingredientID}, {$inc: {amount: 1}}).exec().then(() => {
            res.status(200).send("success");
        }).catch((error) => {
            res.status(500).send(error);
        });
    }

    async function decrementIngredient(req, res) {
        const ingredientID = req.body.ingredientID;

        await FridgeIngredient.findOneAndUpdate({_id: ingredientID}, {$inc: {amount: -1}}).exec().then(() => {
            res.status(200).send("success");
        }).catch((error) => {
            res.status(500).send(error);
        });
    }

    //Used for converting different measurements(ounces to cups. cups to tbsp etc.)
    async function updateIngredientAmount(req, res) {
        const ingredientID = req.body.ingredientID;
        const measure = req.body.measure;
        const amount = req.body.amount;

        await mongoose.connect(process.env.DB_URL).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });

        await FridgeIngredient.findOneAndUpdate({_id: ingredientID}, 
            {$set: {
            amount: amount,
            measurement: measure
            }})
            .exec().then(() => {
            res.status(200).send("success");
        }).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
    }

    //Adds recipe to meal plan.
    async function addMeal(req, res) {
        const fridgeID = req.query.routeID;
        const recipeID = req.query.recipeID;
        const day = req.query.day;

        //Check if valid fridge
        const fridge = await Fridge.find({routeID: fridgeID}).exec().then((val) => {
            if (val === null) {
                res.status(400).send("Invalid fridge routeID");
            }
        }).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });

        //Check if valid recipe.
        const recipe = await Recipe.find({_id: recipeID}).exec().then((val) => {
            if (val === null) {
                res.status(400).send("Invalid recipe ID");
            }
        }).catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });

        const meal = new Meal({
            fridge_id: fridge._id,
            recipe_id: recipe._id,
            day: day
        });

        await meal.save().then(() => {
            res.status(200).send("Success");
        }).catch((error) => {
            console.error(error);
            res.status(500).send("Meal failed to save.");
        });
    }

    //Removes recipe from meal plan.
    async function removeMeal(req, res) {
        const mealID = req.body.mealID;

        await Meal.deleteOne({_id: mealID}).exec().then(() => {
            res.status(200).send("Successfully deleted");
        }).catch((error) => {
            res.status(500).send(error);
        });
    }

    //Reads all meals within meal plan.
    async function readMeals(req, res) {
        const fridgeID = req.body.fridgeID;

        await Meal.find({}).exec().then((mealPlan) => {
            res.status(200).send(res.json(mealPlan));
        }).catch((error) => {
            res.status(500).send(error);
        });
    }

    //Removes relevant ingredients from fridge after user has "completed" a meal.
    //Needs to be implemented
    function completeMeal(req, res) {

    }


    function searchRecipes(req, res) {
        //Needs to be implemented
    }

    return {
        addIngredient: addFridgeIngredient,
        readIngredient: readAllFridgeIngredients,
        removeIngredient: removeFridgeIngredient,
        incrementIngredient: incrementIngredient,
        decrementIngredient: decrementIngredient,
        updateIngredientAmount: updateIngredientAmount,
        addMeal: addMeal,
        deleteMeal: removeMeal,
        readMeals: readMeals
    }
}

export default FridgeController();