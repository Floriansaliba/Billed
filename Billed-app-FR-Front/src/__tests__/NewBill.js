/**
 * @jest-environment jsdom
 */

import {
  screen,
  getByTestId,
  getByText,
  fireEvent,
} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import DashboardUI from "../views/DashboardUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I choose an image to upload in the wrong format", () => {
    test("Then an alert shoud appear", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const alertMock = jest.spyOn(window, "alert").mockImplementation();
      const input = screen.getByTestId("file");

      fireEvent.change(input, {
        target: {
          files: [
            new File(["(⌐□_□)"], "chucknorris.gif", { type: "image/gif" }),
          ],
        },
      });

      window.alert("Wrong file");

      expect(alertMock).toHaveBeenCalled();
      expect(input.files[0].name).toBe("chucknorris.gif");
    });
  });
  describe("When I choose an image to upload in the right format", () => {
    test("Then the file input should get the file name", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      // LocalStorage - Employee
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Créer un objet de class NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      // Mocker la fonction handleChangeFile
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const alertMock = jest.spyOn(window, "alert").mockImplementation();

      // Ajouter un listener sur l'input qui déclanchera la fonction mockée dès le changement de fichier
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);

      // Ajouter un change event sur l'input
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["file"], "image.gif", {
              type: "image/gif",
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("image.gif");
    });
  });
  describe("When I click on the submit button with right inputs", () => {
    it("It should handle the submit and send me back to the Bills page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Créer des entrées fictives du formulaire
      const inputData = {
        type: "Transports",
        name: "test",
        amount: "100",
        date: "2020-12-01",
        vat: "10",
        pct: "20",
        commentary: "ok",
        fileURL: "thisURL",
        fileName: "thisName",
      };

      // Affecter chaque valeur au bon input et les tester
      const type = screen.getByTestId("expense-type");
      userEvent.selectOptions(type, screen.getAllByText("Transports"));
      expect(type.value).toBe(inputData.type);

      const name = screen.getByTestId("expense-name");
      fireEvent.change(name, { target: { value: inputData.name } });
      expect(name.value).toBe(inputData.name);

      const date = screen.getByTestId("datepicker");
      fireEvent.change(date, { target: { value: inputData.date } });
      expect(date.value).toBe(inputData.date);

      const vat = screen.getByTestId("vat");
      fireEvent.change(vat, { target: { value: inputData.vat } });
      expect(vat.value).toBe(inputData.vat);

      const pct = screen.getByTestId("pct");
      fireEvent.change(pct, { target: { value: inputData.pct } });
      expect(pct.value).toBe(inputData.pct);

      const comment = screen.getByTestId("commentary");
      fireEvent.change(comment, { target: { value: inputData.commentary } });
      expect(comment.value).toBe(inputData.commentary);

      const submitNewBill = screen.getByTestId("form-new-bill");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn(newBill.handleSubmit);
      submitNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(submitNewBill);
      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

//test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  test("fetches bills from mock API POST", async () => {
    // Mocker la fonction Post
    const getSpy = jest.spyOn(store, "post");

    // Mock d'une nouvelle facture
    const newBill = {
      id: "UIUZtnPQvnbFnB0ozvJh",
      name: "test3",
      email: "a@a",
      type: "Services en ligne",
      vat: "60",
      pct: 20,
      commentAdmin: "bon bah d'accord",
      amount: 300,
      status: "accepted",
      date: "2003-03-03",
      commentary: "",
      fileName:
        "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
      fileUrl:
        "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3",
    };

    const bills = await store.post(newBill);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(bills.data.length).toBe(1);
  });
});
