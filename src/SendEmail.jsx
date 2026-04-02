// src/utils/sendEmail.js
import emailjs from "emailjs-com";

// Initialize EmailJS once (optional)
export const initEmailJS = () => {
  emailjs.init("AgZ93fw9blc-gRHlv");
};

// Send booking confirmation email
export const sendBookingEmail = async (user, bookingData) => {
  try {
    const response = await emailjs.send(
      "service_3zyarmh",
      "template_kbqxk5x",
      {
        user_name: user.fullName || `${user.firstName} ${user.lastName}` || user.email,
        user_email: user.email,
        destination: bookingData.destination,
        date: bookingData.date,
        people: bookingData.people,
        booking_id: "PP-" + Date.now(),
        total_amount: "$" + bookingData.total_amount,
      },
      "AgZ93fw9blc-gRHlv"
    );
   

  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, message: "Email failed but booking saved" };
  }
};

// Send custom package request confirmation email
export const sendCustomPackageEmail = async (user, bookingData) => {
  try {
    const response = await emailjs.send(
      "service_3zyarmh",
      "template_kbqxk5x",
      {
        user_name: bookingData.userName,
        user_email: bookingData.userEmail,
        destination: bookingData.destinations,
        date: bookingData.travelDate,
        people: bookingData.people || "TBD",
        booking_id: bookingData.requestId || bookingData.bookingId,
        total_amount: bookingData.totalAmount || "TBD",
      },
      "AgZ93fw9blc-gRHlv"
    );
    console.log("Custom package email sent successfully:", response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Custom package email sending failed:", error);
    return { success: false, message: "Email failed but request saved" };
  }
};

// Send new package booking notification to team
export const sendTeamBookingNotification = async (bookingData) => {
  try {
    const response = await emailjs.send(
      "service_3zyarmh",
      "template_4fjvame",
      {
        package_name: bookingData.packageName,
        user_name: bookingData.userName,
        user_email: bookingData.userEmail,
        destination: bookingData.destination || "N/A",
        date: bookingData.travelDate,
        people: bookingData.totalPersons || bookingData.people,
        booking_id: bookingData.bookingId,
        total_amount: bookingData.totalAmount,
      },
      "AgZ93fw9blc-gRHlv"
    );
    console.log("Team booking notification sent successfully:", response);
    return { success: true, message: "Team notified" };
  } catch (error) {
    console.error("Team booking notification failed:", error);
    return { success: false, message: "Team notification failed but booking saved" };
  }
};

// Send custom package request notification to team
export const sendTeamCustomPackageNotification = async (bookingData) => {
  try {
    const response = await emailjs.send(
      "service_3zyarmh",
      "template_4fjvame",
      {
        package_name: "Custom Package Request",
        user_name: bookingData.userName,
        user_email: bookingData.userEmail,
        destination: bookingData.destinations,
        date: bookingData.travelDate,
        people: bookingData.people || "TBD",
        booking_id: bookingData.requestId,
        total_amount: bookingData.totalAmount || "TBD",
      },
      "AgZ93fw9blc-gRHlv"
    );
    console.log("Team custom package notification sent successfully:", response);
    return { success: true, message: "Team notified" };
  } catch (error) {
    console.error("Team custom package notification failed:", error);
    return { success: false, message: "Team notification failed but request saved" };
  }
};