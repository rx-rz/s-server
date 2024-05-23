import { Handler } from "express";
import { v } from "./room.validators";
import { roomRepository } from "./room.repository";
import { httpstatus } from "../ctx";
import { roomTypeRepository } from "../room_types/roomtype.repository";
import { NotFoundError } from "../errors";
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

const getRoomDetails: Handler = async (req, res, next) => {
  try {
    const { roomNo } = v.roomNoValidator.parse(req.query);

    const room = await roomRepository.getRoomDetails(roomNo);
    if (!room) {
      throw new NotFoundError(
        `Room with a room number of ${roomNo} does not exist.`
      );
    }
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
    return res.status(httpstatus.OK).json({
      rooms,
      maxPageNo: Math.ceil(noOfRoomsInDB / (queries.noOfEntries || 10)),
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const updateRoom: Handler = async (req, res, next) => {
  try {
    const { typeId, roomNo, isAvailable } = v.roomUpdateValidator.parse(
      req.body
    );
    const roomTypes = await roomTypeRepository.getRoomTypes();
    const roomExists = await roomRepository.getRoomDetails(roomNo);
    const roomTypeExists = typeId
      ? roomTypes.find((room) => room.id === typeId)
      : true;
    if (!roomTypeExists)
      throw new NotFoundError(
        `Room Type with an ID of ${typeId} does not exist.`
      );
    if (!roomExists) {
      throw new NotFoundError(
        `Room with a room number of ${roomNo} does not exist.`
      );
    }
    const updatedRoom = await roomRepository.updateRoom({
      roomNo,
      typeId,
      isAvailable,
    });
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
    const roomExists = await roomRepository.getRoomDetails(roomNo);
    if (!roomExists) {
      throw new NotFoundError(
        `Room with a room number of ${roomNo} does not exist.`
      );
    }
    const deletedRoom = await roomRepository.deleteRoom(roomNo);
    return res.status(httpstatus.OK).json({
      deletedRoom,
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
