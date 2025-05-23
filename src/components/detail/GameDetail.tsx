"use client";

// Icons
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CurrencyYenIcon from "@mui/icons-material/CurrencyYen";

import { useEffect, useState } from "react";
import { NodeType } from "@/types/NetworkType";
import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";
import DistributorVideos from "./Clips/DistributorVideos";
import DetailTags from "./DetailTags";
import { Box, Tab, Tabs } from "@mui/material";
import PopularityCharts from "./PopularityCharts";
import ReviewCloudPanel from "./ReviewCloudPanel";
import useParentSize from "@visx/responsive/lib/hooks/useParentSize";
import useScreenSize from "@visx/responsive/lib/hooks/useScreenSize";

type Props = {
  node: NodeType;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setOpenPanel: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  swipeOpen?: boolean;
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const GameDetail = (props: Props) => {
  const {
    node,
    setSelectedIndex,
    setOpenPanel,
    selectedTags,
    setSelectedTags,
    swipeOpen
  } = props;

  const [tabIndex, setTabIndex] = useState(0);

  const { parentRef, width:parentW, height:parentH } = useParentSize({ debounceTime: 150 });
  const { width, height } = useScreenSize({ debounceTime: 150 });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const addSelectedTags = (newTag: string) => {
    if (selectedTags.includes(newTag)) return;
    setSelectedTags([...selectedTags, newTag]);
    setOpenPanel("highlight");
  };

  const [currentSlide, setCurrentSlide] = useState(0); // 現在のスライドインデックス
  const screenshots = node.screenshots || [node.imgURL];

  // スライドショーの自動切り替え
  useEffect(() => {
    if (node && screenshots.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prevSlide) => {
          const screenshots = node.screenshots || [];
          return (prevSlide + 1) % screenshots.length;
        });
      }, 2000); // 2秒ごとに切り替え
      return () => clearInterval(interval); // クリーンアップ
    }
  }, [node]);

  return (
    <div ref={parentRef} className="flex-1 bg-gray-800 rounded-l-lg shadow-md flex flex-col space-y-4 relative">
      {/* 選択されたゲームの詳細表示 */}
      {node ? (
        <div className="rounded-lg">
          {/* ゲーム詳細内容 */}
          <div className="flex flex-col">
            {/* 画像とアイコンのコンテナ */}
            {/* スライドショー */}
            {screenshots && (
              <div className="overflow-hidden relative h-[20vh]">
                {screenshots.map((screenshot, index) => (
                  <Image
                    key={index}
                    src={screenshot as string}
                    alt={`${node.title} screenshot ${index + 1}`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      borderRadius: "4px",
                      opacity: currentSlide === index ? 1 : 0,
                      transition: "opacity 0.35s ease-in-out",
                      objectFit: "cover",
                    }}
                    className="rounded mb-2 screenshot-img"
                  />
                ))}
                {/* 画像右上に閉じるボタン */}
                {(width >= 1024 || (width < 1024 && swipeOpen)) &&
                  <div
                    className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-black bg-opacity-50 rounded-full cursor-pointer z-90 transition-transform duration-200 hover:bg-opacity-75 hover:scale-110"
                    onClick={() => setSelectedIndex(-1)}
                  >
                    <span className="text-white text-xl font-bold transition-colors duration-200 hover:text-red-400">
                      ×
                    </span>
                  </div>
                }
              </div>
            )}

            <div className="p-2">
              <div className="flex items-center">
                {/* ゲームタイトル */}
                <h2 className="text-white text-xl font-semibold">
                  <Link
                    href={`https://store.steampowered.com/app/${node.steamGameId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-white hover:underline"
                  >
                    {node.title}
                  </Link>
                </h2>

                {/* Steamリンク */}
                <Tooltip title="Steamで開く">
                  <Link
                    href={`https://store.steampowered.com/app/${node.steamGameId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </Link>
                </Tooltip>
              </div>

              {/* 開発者、発売日、価格 */}
              <div className="flex items-center text-xs space-x-4 mt-1 mb-2">
                {/* 開発者 */}
                <div className="flex items-center">
                  <Tooltip title="開発者">
                    <BuildIcon
                      fontSize="small"
                      className="text-gray-400 mr-1"
                    />
                  </Tooltip>
                  <span className="text-gray-300">{node.developerName}</span>
                </div>

                {/* 発売日 */}
                <div className="flex items-center">
                  <Tooltip title="発売日">
                    <CalendarTodayIcon
                      fontSize="small"
                      className="text-gray-400 mr-1"
                    />
                  </Tooltip>
                  <span className="text-gray-300">
                    {node.releaseDate
                      .replace(/年/, "/")
                      .replace(/月/, "/")
                      .replace(/日/, "")}
                  </span>
                </div>

                {/* 価格 */}
                <div className="flex items-center">
                  <Tooltip title="価格">
                    <CurrencyYenIcon
                      fontSize="small"
                      className="text-gray-400 mr-1"
                    />
                  </Tooltip>
                  <span className="text-gray-300">
                    {node.price ? `${node.price.toLocaleString()}` : "無料"}
                  </span>
                </div>
              </div>

              {/* ゲーム説明文 */}
              <div>
                {node.shortDetails && (
                  <div className="text-white text-sm mt-1 h-24 overflow-y-auto mb-2">
                    {node.shortDetails}
                  </div>
                )}
              </div>

              {/* タグ */}
              {node.tags && (
                <DetailTags
                  tags={node.tags}
                  addSelectedTags={addSelectedTags}
                />
              )}
            </div>
          </div>

          <ReviewCloudPanel parentW={parentW} parentH={parentH} node={node} />

          {node.twitchGameId !== "" && (
            <Box
              sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 2 }}
            >
              <Tabs
                value={tabIndex}
                onChange={handleChange}
                aria-label="basic tabs example"
                centered
              >
                <Tab
                  label="流行度グラフ"
                  {...a11yProps(0)}
                  sx={{ color: "white" }}
                />
                <Tab
                  label="Twitchクリップ"
                  {...a11yProps(1)}
                  sx={{ color: "white" }}
                />
              </Tabs>
            </Box>
          )}

          {tabIndex === 0 && <PopularityCharts node={node} />}
          {tabIndex === 1 && (
            <DistributorVideos twitchGameId={node.twitchGameId} />
          )}
        </div>
      ) : (
        <div className="text-white text-center pt-24">
          ゲームを選択してください。
        </div>
      )}
    </div>
  );
};

export default GameDetail;
