import { URI,Logger } from "@adviser/cement";
import { StoreType } from "@fireproof/core";



export default async (req: Request) => {
  const url = URI.from(req.url);
  const body=req.body;
  console.log("This is the body we receieved",body);
  const carId = url.getParam("car");
  const metaDb = url.getParam("meta");
  if (carId)
  {
    if(req.method=="PUT")
    {

    }
    if(req.method=="GET")
    {

    }
  }
  else if(metaDb)
  {
    if(req.method=="PUT")
    {
      
    }
    if(req.method=="GET")
    {

    }
  }
}

export const config = { path: "/fireproof/aws" };