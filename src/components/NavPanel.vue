<template>
  <v-autocomplete
    v-model="values"
    :items="items"
    outlined
    dense
    chips
    small-chips
    label="Outlined"
    multiple
  />
</template>

<script>
export default {
  name: "NavPanel",

  data: () => ({
    items: ["foo", "bar", "baz", "qux"]
    //
  })
};
</script>
