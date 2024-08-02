import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const CounterModel = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

export default CounterModel;
