<script setup lang="ts">
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Empty,
  Image as AImage,
  message,
  Pagination,
  Popconfirm,
  Spin,
  Tooltip,
} from "ant-design-vue";
import { DeleteOutlined, ShareAltOutlined } from "@ant-design/icons-vue";
import { onBeforeUnmount, onMounted, reactive } from "vue";
import dayjs from "dayjs";
import Bus from "@/bus";
import config from "@/config";
import { getComponentDetail, getComponentList, removeComponent } from "@/api/component";

enum HttpStatus {
  OK = 200,
}

interface DescData {
  label: string;
  value: string;
}

const chartData = reactive<any>({
  chartList: [] as Array<{
    title: string;
    image: string;
    id: string;
    desc: DescData[];
  }>,
  total: 0,
  pageIndex: 1,
  loading: false,
  type: "",
  searchValue: "",
  componentType: "",
});

const convertTime = (timeStr: string) => {
  return dayjs(timeStr).format("YYYY-MM-DD");
};

const getData = () => {
  chartData.loading = true;
  Bus.$emit("search-loading", true);
  const params: any = {
    pageSize: 20,
    pageNo: chartData.pageIndex,
    type: chartData.type,
    componentType: chartData.componentType,
    name: chartData.searchValue,
  };
  if (chartData.type) {
    params.type = chartData.type;
  }
  getComponentList(params)
    .then((res) => {
      const { code, data, msg } = res;
      if (code === HttpStatus.OK) {
        const { list, total } = data;
        chartData.total = total;
        chartData.chartList = list.map((item: any) => {
          const { id, createTime, componentTypeMsg, name, typeMsg, image } = item;
          return {
            id,
            title: name,
            image,
            desc: [
              { value: convertTime(createTime), label: "创建时间" },
              { value: componentTypeMsg, label: "组件类型" },
              { value: typeMsg, label: "类型" },
            ],
          };
        });
      } else {
        message.error(msg || "服务器开小差了，请稍后再试...");
      }
    })
    .finally(() => {
      chartData.loading = false;
      Bus.$emit("search-loading", false);
    });
};

onMounted(() => {
  Bus.$on("search", (res: any) => {
    Object.keys(res).forEach((key) => {
      chartData[key] = res[key];
    });
    chartData.pageIndex = 1;
    getData();
  });
});
onBeforeUnmount(() => {
  Bus.$off("search-loading");
});

const chartClick = async (params: string) => {
  const res = await getComponentDetail(params);
  const { template, componentType, type, id, name } = res.data;
  window.open(buildPlaygroundUrl({ id, name, componentType, type, template }));
};

const pageChange = (pageIndex: number) => {
  chartData.pageIndex = pageIndex;
  getData();
};

const openTab = async (params: string) => {
  const res = await getComponentDetail(params);
  const { template, componentType, type, id, name } = res.data;

  const url = buildPlaygroundUrl({ id, name, componentType, type, template });

  const tempInput = document.createElement("textarea");

  tempInput.style.position = "absolute"; // 确保它不影响布局
  tempInput.style.opacity = "0"; // 隐藏文本区域
  document.body.append(tempInput);

  // 设置要复制的文本
  tempInput.value = url;
  tempInput.select(); // 选中文本

  // 执行复制命令
  try {
    document.execCommand("copy");
  } catch (error) {
    console.error("Error copying text:", error);
  }

  // 删除临时文本区域
  tempInput.remove();
  message.success("分享链接已复制到剪贴板");
};

const handleAdd = () => {
  window.open(
    buildPlaygroundUrl({
      type: chartData.type,
      componentType: chartData.componentType,
    })
  );
};

const buildPlaygroundUrl = (params: {
  id?: string;
  name?: string;
  type?: string | number;
  componentType?: string | number;
  template?: string;
}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === "template" || value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  const search = query.toString() ? `?${query.toString()}` : "";
  const hash = params.template ? `#${params.template}` : "";

  return `${config.playground}/${search}${hash}`;
};

const handleRemove = async (id: string) => {
  try {
    const { code, msg } = await removeComponent(id);
    if (code !== HttpStatus.OK) return message.error(msg);
    message.success(msg);
    getData();
  } catch (error) {
    return message.error(error as any);
  }
};
</script>

<template>
  <div class="chart-list">
    <div class="chart-list_toolbar">
      <div class="chart-list_total">共 {{ chartData.total }} 个模板</div>
      <Button type="primary" @click="handleAdd"> 新增 </Button>
    </div>

    <Spin class="chart-list_body" :spinning="chartData.loading" tip="加载中，请稍后...">
      <div class="chart-grid">
        <Card v-for="(item, index) in chartData.chartList" class="chart-card" :key="index" hoverable>
          <template #title>
            <span class="chart-title" @click="chartClick(item.id)">{{ item.title || "-" }}</span>
          </template>
          <template #extra>
            <div class="chart-actions">
              <Tooltip title="复制分享链接">
                <ShareAltOutlined class="action-icon" @click="openTab(item.id)" />
              </Tooltip>
              <Popconfirm title="确定要删除吗?" @confirm="handleRemove(item.id)">
                <Tooltip title="删除">
                  <DeleteOutlined class="action-icon danger" />
                </Tooltip>
              </Popconfirm>
            </div>
          </template>
          <template #cover>
            <div
              class="chart-cover"
              :class="{ 'is-empty': !item.image }"
              @click="!item.image && chartClick(item.id)"
            >
              <div v-if="item.image" class="chart-preview-trigger" @click.stop>
                <AImage :src="item.image" class="chart-image" :preview="true" />
              </div>
              <Empty v-else class="chart-empty" description="暂无图片" />
            </div>
          </template>
          <Descriptions layout="vertical" :column="3" size="small" @click="chartClick(item.id)">
            <DescriptionsItem v-for="desc in item.desc" :key="desc.label" :label="desc.label">
              {{ desc.value }}
            </DescriptionsItem>
          </Descriptions>
        </Card>
      </div>
    </Spin>

    <div class="pagination">
      <Pagination
        :total="chartData.total"
        :show-total="(total: number) => `共 ${total} 条`"
        @change="pageChange"
        :disabled="chartData.loading"
        :page-size="20"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface);
}

.chart-list_toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.chart-list_total {
  color: var(--app-muted);
  font-size: 13px;
}

.chart-list_body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

:deep(.chart-list_body.ant-spin-nested-loading),
:deep(.chart-list_body .ant-spin-container) {
  height: 100%;
  min-height: 0;
}

:deep(.chart-list_body .ant-spin-container) {
  overflow: auto;
  padding: 2px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  align-content: start;
}

.pagination {
  position: sticky;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: end;
  flex-shrink: 0;
  margin-top: auto;
  padding: 12px 2px 0;
  border-top: 1px solid var(--app-border);
  background: var(--app-surface);
}

.chart-card {
  overflow: hidden;
  cursor: pointer;
}

:deep(.chart-card .ant-card-head) {
  min-height: 44px;
  padding: 0 16px;
  border-bottom-color: var(--app-border);
}

:deep(.chart-card .ant-card-body) {
  padding: 14px 16px 16px;
}

.chart-title {
  display: block;
  overflow: hidden;
  color: var(--app-text);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--app-muted);
}

.chart-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  padding: 10px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-cover-bg);
  cursor: default;
}

.chart-cover.is-empty {
  cursor: pointer;
}

.chart-image {
  width: 100%;
  height: 100%;
}

.chart-preview-trigger {
  width: 100%;
  height: 100%;
}

:deep(.chart-cover .ant-image) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

:deep(.chart-cover .ant-image-img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

:deep(.chart-cover .ant-image-mask) {
  border-radius: 6px;
}

.chart-empty {
  width: 100%;
  height: 100%;
}

:deep(.ant-descriptions-item-label) {
  color: var(--app-muted);
  font-size: 12px;
}

:deep(.ant-descriptions-item-content) {
  color: var(--app-text);
  font-size: 13px;
}

:deep(.ant-descriptions-row > th),
:deep(.ant-descriptions-row > td) {
  padding-bottom: 0 !important;
}

.action-icon {
  font-size: 20px;
  transition: color 0.2s;
}

.action-icon:hover {
  color: #1677ff;
}

.action-icon.danger:hover {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
