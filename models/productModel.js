import mongoose,{Schema,Document,model,models} from "mongoose";

const ProductSchema = new Schema({
    name:{
        type:String,
        required:[true,"Product name is required"]
    },
    costPrice:{
        type: Number,
        required:[true,"Cost Price is required"]
    },
    sellingPrice:{
        type: Number,
        required:[true,"Selling Price is required"]
    },
    skuCode:{
        type:String,
        required:[true,"SKU Code is required"]
    }

},{timestamps:true})

const ProductModel = models.product || mongoose.model("product",ProductSchema);

export default ProductModel;
