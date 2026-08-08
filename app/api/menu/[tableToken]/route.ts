import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

type RouteContext = {
  params: Promise<{
    tableToken: string;
  }>;
};

type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  price: number | string;
  is_available: boolean;
  sort_order: number;
};

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { tableToken } = await context.params;

    if (!tableToken) {
      return NextResponse.json(
        {
          error: "Token da mesa não informado.",
        },
        { status: 400 },
      );
    }

    // 1. Localiza a mesa pelo token público
    const { data: table, error: tableError } = await supabase
      .from("dining_tables")
      .select(
        "id, number, public_token, food_park_id, is_active",
      )
      .eq("public_token", tableToken)
      .eq("is_active", true)
      .maybeSingle();

    if (tableError) {
      console.error("Erro ao buscar mesa:", tableError);

      return NextResponse.json(
        {
          error: "Não foi possível consultar a mesa.",
        },
        { status: 500 },
      );
    }

    if (!table) {
      return NextResponse.json(
        {
          error: "Mesa não encontrada ou desativada.",
        },
        { status: 404 },
      );
    }

    // 2. Busca o Food Park
    const { data: foodPark, error: foodParkError } =
      await supabase
        .from("food_parks")
        .select("id, name, slug")
        .eq("id", table.food_park_id)
        .maybeSingle();

    if (foodParkError) {
      console.error(
        "Erro ao buscar Food Park:",
        foodParkError,
      );

      return NextResponse.json(
        {
          error: "Não foi possível consultar o Food Park.",
        },
        { status: 500 },
      );
    }

    if (!foodPark) {
      return NextResponse.json(
        {
          error: "Food Park não encontrado.",
        },
        { status: 404 },
      );
    }

    // 3. Busca os estabelecimentos ativos
    const {
      data: establishments,
      error: establishmentsError,
    } = await supabase
      .from("establishments")
      .select(
        `
          id,
          name,
          slug,
          kind,
          whatsapp_number,
          description,
          logo_url,
          sort_order
        `,
      )
      .eq("food_park_id", table.food_park_id)
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (establishmentsError) {
      console.error(
        "Erro ao buscar estabelecimentos:",
        establishmentsError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar os estabelecimentos.",
        },
        { status: 500 },
      );
    }

    const establishmentIds = (
      establishments ?? []
    ).map(
      (establishment) => establishment.id,
    );

    if (establishmentIds.length === 0) {
      return NextResponse.json({
        table: {
          id: table.id,
          number: table.number,
          token: table.public_token,
        },
        foodPark,
        establishments: [],
      });
    }

    // 4. Busca categorias ativas
    const {
      data: categories,
      error: categoriesError,
    } = await supabase
      .from("categories")
      .select(
        `
          id,
          establishment_id,
          name,
          sort_order
        `,
      )
      .in("establishment_id", establishmentIds)
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (categoriesError) {
      console.error(
        "Erro ao buscar categorias:",
        categoriesError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar as categorias.",
        },
        { status: 500 },
      );
    }

    // 5. Busca produtos disponíveis
    const {
      data: products,
      error: productsError,
    } = await supabase
      .from("products")
      .select(
        `
          id,
          establishment_id,
          category_id,
          name,
          description,
          image_url,
          base_price,
          is_available,
          sort_order
        `,
      )
      .in("establishment_id", establishmentIds)
      .eq("is_available", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (productsError) {
      console.error(
        "Erro ao buscar produtos:",
        productsError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar os produtos.",
        },
        { status: 500 },
      );
    }

    const productIds = (
      products ?? []
    ).map(
      (product) => product.id,
    );

    // Nenhum produto disponível
    if (productIds.length === 0) {
      return NextResponse.json({
        table: {
          id: table.id,
          number: table.number,
          token: table.public_token,
        },
        foodPark,
        establishments: (
          establishments ?? []
        ).map((establishment) => ({
          ...establishment,
          categories: [],
        })),
      });
    }

    // 6. Busca variantes dos produtos
    const {
      data: variantsData,
      error: variantsError,
    } = await supabase
      .from("product_variants")
      .select(
        `
          id,
          product_id,
          name,
          description,
          price,
          is_available,
          sort_order
        `,
      )
      .in("product_id", productIds)
      .eq("is_available", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (variantsError) {
      console.error(
        "Erro ao buscar variantes:",
        variantsError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar as variantes dos produtos.",
        },
        { status: 500 },
      );
    }

    const variants: ProductVariant[] =
      variantsData ?? [];

    // 7. Busca grupos de opções
    const {
      data: optionGroups,
      error: optionGroupsError,
    } = await supabase
      .from("product_option_groups")
      .select(
        `
          id,
          product_id,
          name,
          min_choices,
          max_choices,
          sort_order
        `,
      )
      .in("product_id", productIds)
      .order("sort_order", {
        ascending: true,
      });

    if (optionGroupsError) {
      console.error(
        "Erro ao buscar grupos de opções:",
        optionGroupsError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar as opções dos produtos.",
        },
        { status: 500 },
      );
    }

    const optionGroupIds = (
      optionGroups ?? []
    ).map(
      (group) => group.id,
    );

    // 8. Busca opções disponíveis
    let options: Array<{
      id: string;
      option_group_id: string;
      name: string;
      price_delta: number | string;
      is_available: boolean;
      sort_order: number;
    }> = [];

    if (optionGroupIds.length > 0) {
      const {
        data: optionsData,
        error: optionsError,
      } = await supabase
        .from("product_options")
        .select(
          `
            id,
            option_group_id,
            name,
            price_delta,
            is_available,
            sort_order
          `,
        )
        .in(
          "option_group_id",
          optionGroupIds,
        )
        .eq("is_available", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        });

      if (optionsError) {
        console.error(
          "Erro ao buscar opções:",
          optionsError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível consultar as opções dos produtos.",
          },
          { status: 500 },
        );
      }

      options = optionsData ?? [];
    }

    // 9. Monta a resposta final
    const formattedEstablishments = (
      establishments ?? []
    ).map((establishment) => {
      const establishmentCategories = (
        categories ?? []
      )
        .filter(
          (category) =>
            category.establishment_id ===
            establishment.id,
        )
        .map((category) => {
          const categoryProducts = (
            products ?? []
          )
            .filter(
              (product) =>
                product.establishment_id ===
                  establishment.id &&
                product.category_id ===
                  category.id,
            )
            .map((product) => {
              // Variantes deste produto
              const productVariants = variants
                .filter(
                  (variant) =>
                    variant.product_id ===
                    product.id,
                )
                .map((variant) => ({
                  id: variant.id,
                  name: variant.name,
                  description:
                    variant.description,
                  price: Number(
                    variant.price,
                  ),
                  sortOrder:
                    variant.sort_order,
                }));

              // Grupos de opções deste produto
              const productOptionGroups = (
                optionGroups ?? []
              )
                .filter(
                  (group) =>
                    group.product_id ===
                    product.id,
                )
                .map((group) => ({
                  id: group.id,
                  name: group.name,
                  minChoices:
                    group.min_choices,
                  maxChoices:
                    group.max_choices,
                  sortOrder:
                    group.sort_order,
                  options: options
                    .filter(
                      (option) =>
                        option.option_group_id ===
                        group.id,
                    )
                    .map((option) => ({
                      id: option.id,
                      name: option.name,
                      priceDelta: Number(
                        option.price_delta,
                      ),
                      sortOrder:
                        option.sort_order,
                    })),
                }));

              // Mantemos price para compatibilidade
              // com o frontend atual.
              const firstVariant =
                productVariants[0];

              return {
                id: product.id,
                name: product.name,
                description:
                  product.description,
                imageUrl:
                  product.image_url,

                price:
                  productVariants.length > 0
                    ? firstVariant.price
                    : Number(
                        product.base_price,
                      ),

                available:
                  product.is_available,

                sortOrder:
                  product.sort_order,

                variants:
                  productVariants,

                optionGroups:
                  productOptionGroups,
              };
            });

          return {
            id: category.id,
            name: category.name,
            sortOrder:
              category.sort_order,
            products: categoryProducts,
          };
        });

      return {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        kind: establishment.kind,
        whatsappNumber:
          establishment.whatsapp_number,
        description:
          establishment.description,
        logoUrl:
          establishment.logo_url,
        sortOrder:
          establishment.sort_order,
        categories:
          establishmentCategories,
      };
    });

    return NextResponse.json({
      table: {
        id: table.id,
        number: table.number,
        token: table.public_token,
      },
      foodPark,
      establishments:
        formattedEstablishments,
    });
  } catch (error) {
    console.error(
      "Erro inesperado na API de menu:",
      error,
    );

    return NextResponse.json(
      {
        error: "Erro interno do servidor.",
      },
      { status: 500 },
    );
  }
}