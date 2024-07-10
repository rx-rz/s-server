import { ctx } from "../ctx";
import { NotFoundError } from "../errors";
import { roomRepository } from "../room/room.repository";
import { roomTypeRepository } from "../room_types/roomtype.repository";

export const getNoOfDays = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);
  const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 3600 * 24));
  return diffInDays;
};

export const checkIfRoomIsAvailable = async (roomNo: number) => {
  const room = await roomRepository.getRoomDetails(roomNo);
  if (room && room.status !== "available") {
    return false;
  }
  return room;
};

type BookingDetails = {
  startDate: string;
  endDate: string;
  roomNo: number;
  paymentAmount: string;
};
export const sendBookingSuccessEmail = async (
  email: string,
  bookingDetails: BookingDetails
) => {
  try {
    const html = `<h1>You have successfully booked a room at Bliss Hotel. </h1>
    <p>Here are the details of your booking:</p>
    <ul>
      <li>Room No: ${bookingDetails.roomNo}</li>
      <li>Start Date: ${bookingDetails.startDate}</li>
      <li>End Date: ${bookingDetails.endDate}</li>
      <li>Payment Amount: ${bookingDetails.paymentAmount}</li>
    </ul>
    `;
    const info = await ctx.transporter.sendMail({
      from: "shifukuhotel@gmail.com",
      to: email,
      subject: "Booking Success",
      html,
    });
    if (info) {
      return info.response;
    }
  } catch (err) {
    throw new Error(`An error occured while sending the email.`);
  }
};

export const sendBookingFailureEmail = async (
  email: string,
  bookingDetails: BookingDetails
) => {
  try {
    const html = `<h1>Booking at Bliss Hotel Failed. </h1>
    <p>Unfortunately, there was an issue with your booking:</p>
    <ul>
      <li>Room No: ${bookingDetails.roomNo}</li>
      <li>Start Date: ${bookingDetails.startDate}</li>
      <li>End Date: ${bookingDetails.endDate}</li>
      <li>Payment Amount: ${bookingDetails.paymentAmount}</li>
    </ul>
    `;
    const info = await ctx.transporter.sendMail({
      from: "shifukuhotel@gmail.com",
      to: email,
      subject: "Booking Failure",
      html,
    });
    if (info) {
      return info.response;
    }
  } catch (err) {
    throw new Error(`An error occured while sending the email.`);
  }
};

