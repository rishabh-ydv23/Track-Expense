import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from "xlsx";
import { startSession } from "mongoose";

//add expense
export async function addExpense(req, res) {
    const userId = req.user.id;
    const { description, amount, date, category } = req.body;

    try {
        if (!description || !amount || !date || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            date: new Date(date),
            category
        });
        await newExpense.save();

        res.json({
            success: true,
            message: "Expense added successfully"
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


//to get expense all
export async function getAllExpenses(req, res) {
    const userId = req.user.id;

    try {
        const expenses = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


// update an expense
export async function updateExpense(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { description, amount } = req.body;

    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );
        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        res.json({
            success: true,
            message: "Expense updated successfully.", data: updatedExpense
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//to delete an expense
export async function deleteExpense(req, res) {
    try {
        const expense = await expenseModel.findByIdAndDelete({ _id: req.params.id }); // fixed typo from incomeController (req.params.is)
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        return res.json({
            success: true,
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


//to download the data in an excel file 
export async function downloadExpenseExcel(req, res) {
    const userId = req.user.id;
    try {
        const expenses = (await expenseModel.find({ userId })).toSorted({ date: -1 });
        const plainData = expenses.map((exp) => ({
            Description: exp.description,
            Amount: exp.amount,
            Category: exp.category,
            Date: new Date(exp.date).toLocaleString(),
        })
        );

        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel");
        XLSX.writeFile(workbook, "expense_details.xlsx");
        res.download("expense_details.xlsx");
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}


//to get expense overview
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);
        const expense = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 });

        const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense = expense.length > 0 ? totalExpense / expense.length : 0;
        const numberOfTransactions = expense.length;
        const recentTransactions = expense.slice(0, 5);

        res.json({
            success: true,
            message: "Expense overview fetched successfully",
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
