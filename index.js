import express from 'express'
import path from 'path'
import {initiateApp} from './src/utils/initiateApp.js'
import {config} from 'dotenv'
config({ path: path.resolve('./config/config.env') })

const app = express();
// import { gracefulShutdown } from 'node-schedule'
initiateApp(app, express );