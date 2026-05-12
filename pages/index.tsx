import { Button, Group } from "@mantine/core";
import Header from "../components/header";

export default function IndexPage() {
  return (
      <>
          <Header />
          <Group mt={50} justify="center">
              <Button size="xl">Welcome to Mantine!</Button>
          </Group>
      </>
  );
}
