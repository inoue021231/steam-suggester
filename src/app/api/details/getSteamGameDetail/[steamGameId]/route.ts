import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { NextResponse } from "next/server";
import { PG_POOL } from "@/constants/PG_POOL";

type Params = {
  params: {
    steamGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const steamGameId = params.steamGameId;

  try {
    const client = await PG_POOL.connect();

    const query = `
      SELECT 
          sd.steam_game_id, 
          sd.twitch_game_id, 
          sd.game_title AS name, 
          sd.webpage_url AS url, 
          sd.img_url AS image, 
          sd.price,
          sd.is_single_player, 
          sd.is_multi_player, 
          sd.is_device_windows, 
          sd.is_device_mac,
          sd.genres,
          sd.tags,
          sd.short_details,
          sd.release_date,
          sd.developer_name,
          sd.review_text,
          sd.similar_games,
          sd.feature_vector,
          sd.background,
          sd.screenshots,
          sd.mp4_movies
      FROM 
          steam_game_data sd
      WHERE 
          sd.steam_game_id = $1;
    `;

    const result = await client.query(query, [steamGameId]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const gameDetailData = result.rows[0];

    let similarGames: string[] = [];
    similarGames = [
      ...new Set(gameDetailData.similar_games["released"] as string[]),
    ];

    const formattedResult: SteamDetailsDataType = {
      // マッチ度で使用
      steamGameId: gameDetailData.steam_game_id,
      twitchGameId: gameDetailData.twitch_game_id,
      title: gameDetailData.name,
      genres: gameDetailData.genres || [],
      price: gameDetailData.price,
      isSinglePlayer: gameDetailData.is_single_player,
      isMultiPlayer: gameDetailData.is_multi_player,
      device: {
        windows: gameDetailData.is_device_windows,
        mac: gameDetailData.is_device_mac,
      },
      tags: gameDetailData.tags || [],

      // 類似度で使用
      imgURL: gameDetailData.image,
      url: gameDetailData.url,

      // 追加項目
      shortDetails: gameDetailData.short_details,
      releaseDate: gameDetailData.release_date,
      developerName: gameDetailData.developer_name,
      review: gameDetailData.review_text,
      similarGames: similarGames,
      featureVector: gameDetailData.feature_vector || [],
      background: gameDetailData.background || "",
      screenshots: gameDetailData.screenshots || [],
      mp4Movies: gameDetailData.mp4_movies || [],
    };

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
