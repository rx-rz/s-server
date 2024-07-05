import { ctx } from "../ctx";
type OTPMail = {
  name: string;
  otp: number;
  subscriberMail: string;
};
export const generateOtp = () => {
  const OTP = Math.floor(Math.random() * 900000) + 100000;
  return OTP;
};

export const sendOTPEmail = async ({ name, otp, subscriberMail }: OTPMail) => {
  try {
    const html = `<h1>Hello ${name},Your OTP is: <br/> <span style="font-size:60px;">${otp}</span></h1><p>It expires in <span style="color:red;">10 minutes.</span></p>`;
    const info = await ctx.transporter.sendMail({
      from: "shifukuhotel@gmail.com",
      to: subscriberMail,
      subject: "OTP Verification code",
      html,
    });
    if (info) {
      return info.response;
    }
  } catch (err) {
    throw new Error("An error occured when sending the email.");
  }
};

export const sendOTPEmailForPasswordCreation = async ({
  name,
  otp,
  subscriberMail,
}: OTPMail) => {
  try {
    const html = `<h1>Hello ${name}, Please proceed with your account creation through this <a href="http://localhost:3000/verify-password-otp">link</a><br/>Your OTP is: <br/> <span style="font-size:60px;">${otp}</span></h1><p>It expires in <span style="color:red;">10 minutes.</span></p>`;
    const info = await ctx.transporter.sendMail({
      from: "shifukuhotel@gmail.com",
      to: subscriberMail,
      subject: "OTP Verification code",
      html,
    });
    if (info) {
      return info.response;
    }
  } catch (err) {
    throw new Error("An error occured when sending the email.");
  }
};
