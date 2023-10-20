import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEvent, ColumnEditorOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import {
  InputNumber,
  InputNumberValueChangeEvent
} from "primereact/inputnumber";
import { ProductService } from "./service/ProductService";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

interface ColumnMeta {
  field: string;
  header: string;
}

interface Country {
  name: string;
  code: string;
}

export default function CellEditingDemo() {
  const [products, setProducts] = useState<Product[] | null>(null);

  const columns: ColumnMeta[] = [
    { field: "country", header: "Country" },
    { field: "code", header: "Code" },
    { field: "name", header: "Name" },
    { field: "quantity", header: "Quantity" },
    { field: "price", header: "Price" }
  ];

  useEffect(() => {
    ProductService.getProductsSmall().then((data) => setProducts(data));
  }, []);

  const isPositiveInteger = (val: any) => {
    let str = String(val);

    str = str.trim();

    if (!str) {
      return false;
    }

    str = str.replace(/^0+/, "") || "0";
    let n = Math.floor(Number(str));

    return n !== Infinity && String(n) === str && n >= 0;
  };

  const onCellEditComplete = (e: ColumnEvent) => {
    let { rowData, newValue, field, originalEvent: event } = e;

    switch (field) {
      case "quantity":
      case "price":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "country":
        //if (typeof newValue == "object") rowData[field] = newValue.name;
        //despuess de modificar el optionLabel y el optionValue de <Dropdown> a "code"
        if (newValue) rowData[field] = newValue;
        else event.preventDefault();
        break;
      default:
        if (newValue.trim().length > 0) {
          rowData[field] = newValue;
        } else {
          console.log("before prevent default");
          event.preventDefault();
        }
        break;
    }
  };

  const cellEditor = (options: ColumnEditorOptions) => {
    if (options.field === "price") return priceEditor(options);
    else if (options.field === "country") return dropdownEditor(options);
    else return textEditor(options);
  };

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const dropdownEditor = (options: ColumnEditorOptions) => {
    const countries: Country[] = [
      { name: "Australia", code: "AU" },
      { name: "Brazil", code: "BR" },
      { name: "China", code: "CN" },
      { name: "Egypt", code: "EG" },
      { name: "France", code: "FR" },
      { name: "Germany", code: "DE" },
      { name: "India", code: "IN" },
      { name: "Japan", code: "JP" },
      { name: "Spain", code: "ES" },
      { name: "United States", code: "US" }
    ];

    return (
      <div className="flex">
        <Dropdown
          //add to fix the issue https://codesandbox.io/s/rough-currying-gmj3xh?file=/src/demo/DataTableEditDemo.js
          appendTo={"self"}
          //value={selectedCountry}
          //testing with options.value tambien cambiar en el if newValue del case del dropdown
          value={options.value}
          onChange={(e: DropdownChangeEvent) => {
            setSelectedCountry(e.value);
            options.editorCallback!(e.target.value);
            console.log("filterEditor onChange triggered");
          }}
          options={countries}
          //optionLabel="name"
          //se modifico el optionLabel a:
          optionLabel="code"
          //se agrego optionValue:
          optionValue="code"
          placeholder="Select a Country"
          className="w-full md:w-14rem"
        />
      </div>
    );
  };

  const textEditor = (options: ColumnEditorOptions) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          options.editorCallback!(e.target.value)
        }
      />
    );
  };

  const priceEditor = (options: ColumnEditorOptions) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e: InputNumberValueChangeEvent) =>
          options.editorCallback!(e.value)
        }
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    );
  };

  const priceBodyTemplate = (rowData: Product) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(rowData.price);
  };

  return (
    <div className="card p-fluid">
      <DataTable
        value={products}
        editMode="cell"
        tableStyle={{ minWidth: "50rem" }}
      >
        {columns.map(({ field, header }) => {
          return (
            <Column
              key={field}
              field={field}
              header={header}
              style={{ width: "20%" }}
              body={field === "price" && priceBodyTemplate}
              editor={(options) => cellEditor(options)}
              onCellEditComplete={onCellEditComplete}
            />
          );
        })}
      </DataTable>
    </div>
  );
}
