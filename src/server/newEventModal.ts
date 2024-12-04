"use server";

export async function createNewEvent(formData: FormData) {
  console.log("hi");
  const newEvent = {
    title: formData.get("title"),
    date: formData.get("date"),
    startHours: formData.get("startHours"),
    endHours: formData.get("endHours"),
    description: formData.get("description"),
  };
  console.log(newEvent);
}
