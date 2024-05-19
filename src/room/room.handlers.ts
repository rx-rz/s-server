import { Handler } from "express";
import { v } from "./room.validators";
import { roomRepository } from "./room.repository";
import { httpstatus } from "../ctx";

const createRoom: Handler = async (req, res, next) => {
  try {
    const { noOfRooms, typeId } = v.roomCreationValidator.parse(req.body);
    await roomRepository.createRoom({ noOfRooms, typeId });
    return res.status(httpstatus.CREATED).json({
      message: `${noOfRooms} rooms have been created.`,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const updateRoom: Handler = async (req, res, next) => {
  try {
    const { typeId, roomNo } = v.roomUpdateValidator.parse(req.body);
    const updatedRoom = await roomRepository.updateRoom({ roomNo, typeId });
    return res.status(httpstatus.OK).json({
      updatedRoom,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const deleteRoom: Handler = async (req, res, next) => {
  try {
    const { roomNo } = v.roomNoValidator.parse(req.query);
    const deletedRoom = await roomRepository.deleteRoom(roomNo);
    return res.status(httpstatus.OK).json({
      deletedRoom,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const getRoomDetails: Handler = async (req, res, next) => {
  try {
    const { roomNo } = v.roomNoValidator.parse(req.query);
    const room = await roomRepository.getRoomDetails(roomNo, true);
    return res.status(httpstatus.OK).json({
      room,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const listRooms: Handler = async (req, res, next) => {
  try {
    const queries = v.listRoomValidator.parse(req.query);
    const rooms = await roomRepository.listRooms(queries);
    const noOfRoomsInDB = await roomRepository.getTotalNoOfRooms();
    console.log({noOfRoomsInDB})
    return res.status(httpstatus.OK).json({
      rooms,
      maxPageNo: Math.ceil(noOfRoomsInDB / (queries.noOfEntries || 10)),
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

export const roomHandlers = {
  createRoom,
  deleteRoom,
  getRoomDetails,
  updateRoom,
  listRooms,
};
